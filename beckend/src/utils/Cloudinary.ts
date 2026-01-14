import {v2 as cloudinary} from "cloudinary"
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const getPublicId = (url: string) => {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    const publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, "");
  };
const deleteImageFromCloudinary = async(url:string,rt="image") =>{
    try {
        const filename = getPublicId(url);
        await cloudinary.uploader.destroy(filename, {
            resource_type: rt,
          });
          
            
    } catch (error) {
        console.log("cant delete old image",error)
    }
}


export {deleteImageFromCloudinary}