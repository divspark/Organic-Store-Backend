import * as recognizeService from "../services/recognizeService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const newReco = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No image uploaded");
    }

    const recognitionResult = await recognizeService.recognizeImageConcept(req.file);

    if (recognitionResult) {
      return sendSuccess(res, 200, "Image recognized successfully", recognitionResult);
    } else {
      return sendError(res, 404, "No concepts predicted");
    }
  } catch (error) {
    console.error("Recognition error:", error);
    return sendError(res, 500, "Internal server error during image recognition", error);
  }
};
