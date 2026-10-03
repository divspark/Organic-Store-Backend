import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import mime from "mime";
import supabase from "../config/supabaseClient.js";

/**
 * Uploads a file (buffer or disk path) to Supabase Storage and returns the public URL.
 * @param {Object|string} file - Multer file object or file path string.
 * @param {string} bucketName - Supabase storage bucket name (default: "images").
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export const uploadToSupabase = async (file, bucketName = "images") => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  let fileBuffer;
  let originalName = "uploaded-file";
  let contentType = "application/octet-stream";

  if (typeof file === "string") {
    // If a raw file path is passed
    fileBuffer = await fs.promises.readFile(file);
    originalName = file;
    const ext = originalName.split(".").pop();
    contentType = mime.getType(ext) || contentType;
  } else if (file.buffer) {
    // Multer memory storage
    fileBuffer = file.buffer;
    originalName = file.originalname || originalName;
    const ext = originalName.split(".").pop();
    contentType = file.mimetype || mime.getType(ext) || contentType;
  } else if (file.path) {
    // Multer disk storage
    fileBuffer = await fs.promises.readFile(file.path);
    originalName = file.originalname || file.filename || originalName;
    const ext = originalName.split(".").pop();
    contentType = file.mimetype || mime.getType(ext) || contentType;
  } else {
    throw new Error("Unsupported file format for Supabase upload.");
  }

  const fileExt = originalName.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // If Supabase environment variables are unconfigured, return demo CDN path gracefully
  if (
    !process.env.SUPABASE_URL ||
    process.env.SUPABASE_URL.includes("placeholder")
  ) {
    return `https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80#${fileName}`;
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading image to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

/**
 * Deletes a file from Supabase Storage bucket.
 * @param {string} filePath - Path of the file inside the bucket.
 * @param {string} bucketName - Supabase storage bucket name (default: "images").
 */
export const deleteFromSupabase = async (filePath, bucketName = "images") => {
  if (!filePath) return;
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("placeholder")) return;

  const { error } = await supabase.storage.from(bucketName).remove([filePath]);
  if (error) {
    console.error(`Error deleting file from Supabase: ${error.message}`);
  }
};

export default uploadToSupabase;
