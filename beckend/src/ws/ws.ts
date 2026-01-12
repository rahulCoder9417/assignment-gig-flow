import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("register", (userId: string) => {
      socket.join(userId);
    });
    socket.on("close", (userId: string) => {
      socket.leave(userId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
