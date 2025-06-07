import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BoardInvitePage({ params }: { params: { boardId: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const boardId = String(params.boardId);
    const email = String(session.user.email);
    // Kiểm tra đã là thành viên chưa
    const existing = await prisma.boardMember.findUnique({
      where: { boardId_email: { boardId, email } },
    });
    if (!existing) {
      // Lấy thông tin board để kiểm tra owner
      const board = await prisma.board.findUnique({ where: { id: boardId } });
      if (board && board.createdBy !== email) {
        await prisma.boardMember.create({
          data: { boardId, email, role: "member" },
        });
      }
      // Nếu là owner thì không cần thêm
    }
    redirect(`/boards/${boardId}`);
  } else {
    redirect(`/auth/signin?inviteBoard=${params.boardId}`);
  }
  return null;
} 