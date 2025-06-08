import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    res.socket.server.io = io;
  }
  res.end();
} 