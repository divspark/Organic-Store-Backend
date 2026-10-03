import path from "path";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

export const uploadFileToCloud = async (file, bucket = "images") => {
  return await uploadToSupabase(file, bucket);
};

export const formatUploadedFilePath = (file) => {
  if (!file) return null;
  return path.join("uploads", file.filename).replace(/\\/g, "/");
};
