import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import http from "http";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./ws/ws.js";

const PORT = process.env.PORT || 8000;

// Create ONE server
const server = http.createServer(app);

// Attach Socket.IO to THAT server
initSocket(server);

// Connect DB, then start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`⚙️ Server + WS running on port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err);
  });
