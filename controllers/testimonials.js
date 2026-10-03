import * as testimonialsService from "../services/testimonialsService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const newTest = async (req, res) => {
  const { name, message } = req.body;
  const photo = req.file || req.body.photo;

  if (!name || !message) {
    return sendError(res, 400, "Name and message are required");
  }

  try {
    const newTestimonial = await testimonialsService.createTestimonial({
      name,
      message,
      photo,
    });
    return sendSuccess(
      res,
      201,
      "Testimonial submitted successfully",
      newTestimonial
    );
  } catch (error) {
    console.error("Testimonial submission error:", error);
    return sendError(res, 500, "Failed to submit testimonial", error);
  }
};

export const allTest = async (req, res) => {
  try {
    const testimonials = await testimonialsService.fetchAllTestimonials();
    return sendSuccess(
      res,
      200,
      "Testimonials fetched successfully",
      testimonials
    );
  } catch (error) {
    console.error("Fetching testimonials error:", error);
    return sendError(res, 500, "Failed to fetch testimonials", error);
  }
};
