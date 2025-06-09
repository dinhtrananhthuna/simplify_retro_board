import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Quản lý trạng thái online theo board: boardId => Map<email, { role, online }>
const boardPresenceMap = new Map();

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('[Socket] Initializing socket server');
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      // Không disconnect socket nếu không có token, chỉ xử lý presence khi client emit

      // presence:join
      socket.on("presence:join", async ({ boardId, email }) => {
        console.log(`[Socket] User attempting to join board: ${boardId} with email: ${email}`);
        
        if (!email) {
          console.log(`[Socket] No email provided for board: ${boardId}`);
          socket.emit("error", { message: "Email is required." });
          return;
        }
        console.log(`[Socket] User ${email} attempting to join board: ${boardId}`);
        socket.data.email = email;
        // Kiểm tra quyền truy cập board
        const member = await prisma.boardMember.findUnique({
          where: { boardId_email: { boardId, email } },
        });
        if (!member) {
          console.log(`[Socket] User ${email} not authorized for board: ${boardId}`);
          socket.emit("error", { message: "Bạn không có quyền truy cập board này." });
          return;
        }
        console.log(`[Socket] User ${email} successfully joined board: ${boardId} with role: ${member.role}`);
        socket.join(boardId);
        if (!boardPresenceMap.has(boardId)) boardPresenceMap.set(boardId, new Map());
        boardPresenceMap.get(boardId).set(email, { role: member.role, online: true });
        
        // Gửi cho các thành viên khác
        socket.to(boardId).emit("presence:joined", { email, role: member.role });
        console.log(`[Socket] Notified other members about ${email} joining board: ${boardId}`);
        
        // Gửi danh sách online cho user vừa join
        const members = Array.from(boardPresenceMap.get(boardId).entries()).map(([e, { role, online }]) => ({ email: e, role, online }));
        console.log(`[Socket] Sending presence list to ${email}:`, members);
        socket.emit("presence:list", { members });
      });

      // presence:leave
      socket.on("presence:leave", ({ boardId }) => {
        const email = socket.data.email;
        if (!email) return;
        if (boardPresenceMap.has(boardId)) {
          boardPresenceMap.get(boardId).delete(email);
          socket.to(boardId).emit("presence:left", { email });
        }
      });

      // vote:add
      socket.on("vote:add", async ({ stickerId }) => {
        const email = socket.data.email;
        if (!email) {
          socket.emit("error", { message: "Email is required." });
          return;
        }

        try {
          // Kiểm tra sticker có tồn tại không
          const sticker = await prisma.sticker.findUnique({
            where: { id: stickerId },
            include: { board: true }
          });
          
          if (!sticker) {
            socket.emit("error", { message: "Sticker not found." });
            return;
          }

          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: { boardId_email: { boardId: sticker.boardId, email } },
          });
          if (!member && sticker.board.createdBy !== email) {
            socket.emit("error", { message: "Unauthorized." });
            return;
          }

          // Kiểm tra đã vote chưa
          const existingVote = await prisma.vote.findUnique({
            where: { stickerId_email: { stickerId, email } },
          });
          if (existingVote) {
            socket.emit("error", { message: "Already voted." });
            return;
          }

          // Tạo vote
          await prisma.vote.create({
            data: { stickerId, email },
          });

          // Emit cho tất cả members trong board
          socket.to(sticker.boardId).emit("vote:added", { stickerId, email });
          socket.emit("vote:added", { stickerId, email }); // Emit cho chính user này
          console.log(`[Socket] Vote added by ${email} for sticker: ${stickerId}`);
        } catch (error) {
          console.error(`[Socket] Error adding vote:`, error);
          socket.emit("error", { message: "Failed to add vote." });
        }
      });

      // vote:remove
      socket.on("vote:remove", async ({ stickerId }) => {
        const email = socket.data.email;
        if (!email) {
          socket.emit("error", { message: "Email is required." });
          return;
        }

        try {
          // Kiểm tra sticker có tồn tại không
          const sticker = await prisma.sticker.findUnique({
            where: { id: stickerId },
            include: { board: true }
          });
          
          if (!sticker) {
            socket.emit("error", { message: "Sticker not found." });
            return;
          }

          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: { boardId_email: { boardId: sticker.boardId, email } },
          });
          if (!member && sticker.board.createdBy !== email) {
            socket.emit("error", { message: "Unauthorized." });
            return;
          }

          // Tìm và xóa vote
          const vote = await prisma.vote.findUnique({
            where: { stickerId_email: { stickerId, email } },
          });
          if (!vote) {
            socket.emit("error", { message: "Vote not found." });
            return;
          }

          await prisma.vote.delete({
            where: { id: vote.id },
          });

          // Emit cho tất cả members trong board
          socket.to(sticker.boardId).emit("vote:removed", { stickerId, email });
          socket.emit("vote:removed", { stickerId, email }); // Emit cho chính user này
          console.log(`[Socket] Vote removed by ${email} for sticker: ${stickerId}`);
        } catch (error) {
          console.error(`[Socket] Error removing vote:`, error);
          socket.emit("error", { message: "Failed to remove vote." });
        }
      });

      // comment:add
      socket.on("comment:add", async ({ stickerId, content }) => {
        const email = socket.data.email;
        if (!email) {
          socket.emit("error", { message: "Email is required." });
          return;
        }

        try {
          // Validation input
          if (!content || content.trim().length === 0) {
            socket.emit("error", { message: "Comment content is required." });
            return;
          }
          if (content.length > 500) {
            socket.emit("error", { message: "Comment too long (max 500 characters)." });
            return;
          }

          // Kiểm tra sticker có tồn tại không
          const sticker = await prisma.sticker.findUnique({
            where: { id: stickerId },
            include: { board: true }
          });
          
          if (!sticker) {
            socket.emit("error", { message: "Sticker not found." });
            return;
          }

          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: { boardId_email: { boardId: sticker.boardId, email } },
          });
          if (!member && sticker.board.createdBy !== email) {
            socket.emit("error", { message: "Unauthorized." });
            return;
          }

          // Tạo comment
          const comment = await prisma.comment.create({
            data: { 
              stickerId, 
              email, 
              content: content.trim() 
            },
          });

          // Emit cho tất cả members trong board
          socket.to(sticker.boardId).emit("comment:added", comment);
          socket.emit("comment:added", comment); // Emit cho chính user này
          console.log(`[Socket] Comment added by ${email} for sticker: ${stickerId}`);
        } catch (error) {
          console.error(`[Socket] Error adding comment:`, error);
          socket.emit("error", { message: "Failed to add comment." });
        }
      });

      // comment:update
      socket.on("comment:update", async ({ id, content }) => {
        const email = socket.data.email;
        if (!email) {
          socket.emit("error", { message: "Email is required." });
          return;
        }

        try {
          // Validation input
          if (!content || content.trim().length === 0) {
            socket.emit("error", { message: "Comment content is required." });
            return;
          }
          if (content.length > 500) {
            socket.emit("error", { message: "Comment too long (max 500 characters)." });
            return;
          }

          // Tìm comment
          const comment = await prisma.comment.findUnique({
            where: { id },
            include: { 
              sticker: { 
                include: { board: true } 
              } 
            }
          });
          
          if (!comment) {
            socket.emit("error", { message: "Comment not found." });
            return;
          }

          // Kiểm tra quyền edit (chỉ comment owner)
          if (comment.email !== email) {
            socket.emit("error", { message: "Unauthorized to edit this comment." });
            return;
          }

          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: { boardId_email: { boardId: comment.sticker.boardId, email } },
          });
          if (!member && comment.sticker.board.createdBy !== email) {
            socket.emit("error", { message: "Unauthorized." });
            return;
          }

          // Cập nhật comment
          const updatedComment = await prisma.comment.update({
            where: { id },
            data: { content: content.trim() },
          });

          // Emit cho tất cả members trong board
          socket.to(comment.sticker.boardId).emit("comment:updated", updatedComment);
          socket.emit("comment:updated", updatedComment); // Emit cho chính user này
          console.log(`[Socket] Comment updated by ${email} for comment: ${id}`);
        } catch (error) {
          console.error(`[Socket] Error updating comment:`, error);
          socket.emit("error", { message: "Failed to update comment." });
        }
      });

      // comment:delete
      socket.on("comment:delete", async ({ id }) => {
        const email = socket.data.email;
        if (!email) {
          socket.emit("error", { message: "Email is required." });
          return;
        }

        try {
          // Tìm comment
          const comment = await prisma.comment.findUnique({
            where: { id },
            include: { 
              sticker: { 
                include: { board: true } 
              } 
            }
          });
          
          if (!comment) {
            socket.emit("error", { message: "Comment not found." });
            return;
          }

          // Kiểm tra quyền delete (comment owner hoặc board owner)
          const isCommentOwner = comment.email === email;
          const isBoardOwner = comment.sticker.board.createdBy === email;
          
          if (!isCommentOwner && !isBoardOwner) {
            socket.emit("error", { message: "Unauthorized to delete this comment." });
            return;
          }

          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: { boardId_email: { boardId: comment.sticker.boardId, email } },
          });
          if (!member && !isBoardOwner) {
            socket.emit("error", { message: "Unauthorized." });
            return;
          }

          // Xóa comment
          await prisma.comment.delete({
            where: { id },
          });

          // Emit cho tất cả members trong board
          socket.to(comment.sticker.boardId).emit("comment:deleted", { id });
          socket.emit("comment:deleted", { id }); // Emit cho chính user này
          console.log(`[Socket] Comment deleted by ${email} for comment: ${id}`);
        } catch (error) {
          console.error(`[Socket] Error deleting comment:`, error);
          socket.emit("error", { message: "Failed to delete comment." });
        }
      });

      // disconnect
      socket.on("disconnect", () => {
        const email = socket.data.email;
        if (!email) return;
        for (const [boardId, memberMap] of boardPresenceMap.entries()) {
          if (memberMap.has(email)) {
            memberMap.delete(email);
            socket.to(boardId).emit("presence:left", { email });
          }
        }
      });
    });

    res.socket.server.io = io;
  }
  
  // Handle GET request to return success after initialization
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Socket server ready' });
  }
  
  res.end();
} 