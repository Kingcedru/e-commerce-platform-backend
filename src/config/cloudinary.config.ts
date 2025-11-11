// src/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import DatauriParser from "datauri/parser";
import * as path from "path";

// Load environment variables for credentials
import * as dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Converts a Multer file buffer into a Data URI string.
 * This is the standard way to prepare a file for Cloudinary upload without saving it locally first.
 */
const parser = new DatauriParser();
export const dataUri = (file: Express.Multer.File) => {
  parser.format(path.extname(file.originalname).toString(), file.buffer);
  return parser.content;
};

export default cloudinary;
