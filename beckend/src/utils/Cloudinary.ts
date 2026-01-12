import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const deleteImageFromCloudinary = async(url:string,rt="image") =>{
    try {
        const filename = url.split('/').pop()!.split('.')[0];
        
         await cloudinary.api
        .delete_resources([filename], 
            { type: 'upload', resource_type: rt })
        
            
    } catch (error) {
        throw new ApiError(400,"error while delteing")
    }
}


export {deleteImageFromCloudinary}