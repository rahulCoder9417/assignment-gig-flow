import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });
  console.log("Socket.io initialized on port ", process.env.PORT);

  io.on("connection", (socket) => {
    socket.on("register", (userId: string) => {
      console.log("User registered:", userId);
      socket.join(userId);
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
