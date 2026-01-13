import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async(req: Request, res: Response, next: NextFunction) => {
  
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
      
      // console.log(token);
      if (!token) {
          throw new ApiError(401, "Unauthorized request cause of token")
      }
  
      const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
      if (!user) {
          
          throw new ApiError(401, "Invalid Access Token")
      }
  
      req.user = user;
      next()
  
  
}