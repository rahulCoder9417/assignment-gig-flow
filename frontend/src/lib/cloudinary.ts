
// Add this at the top of your component, before the Uploading function
const uploadToCloudinary = async (file:File, resourceType = "auto") => {
    console.log("🔵 [CLOUDINARY] Uploading:", file.name);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ [CLOUDINARY] Upload failed:", error);
      throw new Error(error.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    console.log("✅ [CLOUDINARY] Upload successful:", data.secure_url);
    return data;
  };


export {uploadToCloudinary}