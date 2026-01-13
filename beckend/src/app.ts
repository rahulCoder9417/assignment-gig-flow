import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// CORS configuration
const corsOptions = {
    origin: function (origin: string, callback: any) {
      const allowedOrigins = [
        "http://localhost:5173",

      ];
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

app.use(cors(corsOptions as any))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.get("/api/health", (req, res) =>   res.status(200).json({ status: "ok", timestamp: new Date() }))


//routes import
import userRoutes from "./routes/user.routes.js";
import gigRoutes from "./routes/gigs.routes.js";
import bidRoutes from "./routes/bids.routes.js";
import { registerUser, loginUser } from "./controllers/user.controller.js";

//routes use
app.post("/api/auth/register", registerUser);
app.post("/api/auth/login", loginUser);
app.use("/api/users", userRoutes)
app.use("/api/gigs", gigRoutes)
app.use("/api/bids", bidRoutes)

export default app
export { app }