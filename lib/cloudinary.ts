import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary with the user's environment variable URL
// It automatically detects CLOUDINARY_URL if it exists in process.env
cloudinary.config({
  secure: true,
});

export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folderName: string = "worklyn",
  options?: { aspectRatio?: string; crop?: string; gravity?: string }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: folderName,
      resource_type: "image",
      crop: options?.crop || "fill",
      gravity: options?.gravity || "auto",
    };
    if (options?.aspectRatio) {
      uploadOptions.aspect_ratio = options.aspectRatio;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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
