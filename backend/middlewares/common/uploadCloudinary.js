import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageCloudinary = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "BakeApp",
    allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
    // public_id: (req, file) => Date.now() + "_" + file.originalname 
  },
});

const uploadCloudinary = multer({ storage: storageCloudinary });

export { cloudinary, uploadCloudinary }