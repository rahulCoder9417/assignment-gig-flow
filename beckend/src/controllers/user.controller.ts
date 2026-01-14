import { Request, Response } from "express";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { deleteImageFromCloudinary } from "../utils/Cloudinary.js";
import { console } from "inspector";
interface options {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none";
}
const generateAccessAndRefereshTokens = async(userId: string) =>{
  try {
      const user = await User.findById(userId)
      if(!user){
        throw new ApiError(404, "User not found")
      }
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token", )
  }
}
const registerUser = async (req: Request, res: Response) => {
  const {name, email, username, password ,avatarUrl, coverImage} = req.body

  if (
      [name, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }

  

  if (!avatarUrl) {
      throw new ApiError(400, "Avatar url is required")
  }

  if (!coverImage) {
      throw new ApiError(400, "Cover Image url is required")
  }
 

  const user = await User.create({
      name,
      avatarUrl,
      coverImage,
      email, 
      password,
      username: username.toLowerCase()!
  })

  const createdUser = await User.findById(user._id).select(
      "-password"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }
  
  const options:options  = {
      httpOnly: true,
      secure: true,       
      sameSite: 'none', 
  }

  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(String(user._id))
  return res
  .status(201)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          201, 
          createdUser,
        "User registered Successfully"
      )
  )
} 


const loginUser = async (req: Request, res: Response) =>{
    

  const {email, username, password} = req.body


  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(String(user._id))

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options:options = {
      httpOnly: true,
      secure: true,            
      sameSite: 'none', 
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

}

const logoutUser = async(req: Request, res: Response) => {
    console.log("logout in beckend")
  await User.findByIdAndUpdate(
      req.user!._id,
      {
          $unset: {
              refreshToken: 1
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
}

const refreshAccessToken = async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken:any= jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET!
      )
  
      const user = await User.findById(String(decodedToken?._id))
          
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options:options = {
          httpOnly: true,
          secure: true,      // HTTPS only
          sameSite: 'none'  
      }
      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

      const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(String(user._id))

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken:refreshToken},
              "Access token refreshed"
          )
      )
  } catch (error:any) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

}

const loginViaAccessToken =   async(req: Request, res: Response) => {
  const incomingAccessToken = req.cookies.accessToken || req.body.accessToken


  if (!incomingAccessToken) {
      return res.status(401).json(new ApiResponse(401, {}, "Unauthorized request"))
  }

  try {
      const decodedToken:any = jwt.verify(
          incomingAccessToken,
          process.env.ACCESS_TOKEN_SECRET!
      )
      const user = await User.findById(String(decodedToken?._id))
      if (!user) {
          return res.status(401).json(new ApiResponse(401, {}, "Invalid access token"))
      
     
      }
  
      const options:options = {
          httpOnly: true,
          secure: true,    // HTTPS only
          sameSite: 'none'  
      }
  
      const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(String(user._id))

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {
                  user: user, accessToken, refreshToken
              },
              "User logged In Successfully"
          )
      )
  } catch (error:any) {
      return res.status(401).json(new ApiResponse(401, {}, error?.message || "Invalid access token"))
  }
}

const changeCurrentPassword = async(req: Request, res: Response) => {
  const {oldPassword, newPassword} = req.body
  const user = await User.findById(req.user?._id)
  if (!user) {
      throw new ApiError(404, "User not found")
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
}


const getCurrentUser = async(req: Request, res: Response) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
}

const updateAccountDetails = async(req: Request, res: Response) => {
  const {fullName, username} = req.body
  if (!fullName && !username) {
      throw new ApiError(400, "one fields are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullName,
              username
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
}

const updateUserAvatar = async(req: Request, res: Response) => {
  const avatarUrl = req.body.avatarUrl

  if (!avatarUrl) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatarUrl: avatarUrl
          }
      },
      {new: false, 
      projection: { avatarUrl: 1 } }
      ).select("-password")
  
  const oldAvatarUrl = user?.avatarUrl;
  if (oldAvatarUrl) {
       await deleteImageFromCloudinary(oldAvatarUrl); 
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200,avatarUrl, "Avatar image updated successfully")
  )
}

const updateUserCoverImage = async(req: Request, res: Response) => {
  const coverImage = req.body.coverImage

  if (!coverImage) {
      throw new ApiError(400, "Cover image file is missing")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage
          }
      },
      {new: false, 
          projection: { coverImage: 1 } }
  ).select("-password")
  const oldCoverImage = user?.coverImage;
  if (oldCoverImage) {
      await deleteImageFromCloudinary(oldCoverImage); 
  }
  return res
  .status(200)
  .json(
      new ApiResponse(200,coverImage, "Cover image updated successfully")
  )
}

const getProfile = async(req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
  if (!user) {
      throw new ApiError(404, "User not found")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, user, "User fetched successfully"))
}
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  loginViaAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getProfile
}
