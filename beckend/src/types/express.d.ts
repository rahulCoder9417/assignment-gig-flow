import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}
import { IUser } from "../models/user.model.js"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}
