import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sports_academy_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi"],
    resource_type: "auto", // Allows both images and videos
  },
});

const upload = multer({ storage });

export default upload;
