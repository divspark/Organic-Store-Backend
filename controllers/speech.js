import * as speechService from "../services/speechService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const voiceReco = (req, res) => {
  try {
    const userInput =
      req.query.input ||
      req.query.query ||
      req.query.q ||
      req.body.input ||
      req.body.query ||
      req.body.text;

    if (!userInput) {
      return sendError(res, 400, "Input query parameter or body text is required");
    }

    const response = speechService.processVoiceQuery(userInput);

    if (response) {
      return sendSuccess(res, 200, "Voice recognized successfully", response);
    } else {
      return sendError(res, 404, "Product not found for spoken query");
    }
  } catch (error) {
    console.error("Voice processing error:", error);
    return sendError(res, 500, "Voice processing failed", error);
  }
};
