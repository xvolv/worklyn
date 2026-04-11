import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with the user's environment variable URL
// It automatically detects CLOUDINARY_URL if it exists in process.env
cloudinary.config({
  secure: true,
});

export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folderName: string = "worklyn"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
        aspect_ratio: "16:9",
        crop: "fill",
        gravity: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;
