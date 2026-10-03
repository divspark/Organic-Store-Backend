import * as uploadService from "../services/uploadService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file selected");
    }

    const fileUrl = await uploadService.uploadFileToCloud(req.file);

    return sendSuccess(res, 200, "File uploaded successfully", {
      url: fileUrl,
      file: req.file.originalname,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return sendError(res, 500, "Failed to upload file", error);
  }
};