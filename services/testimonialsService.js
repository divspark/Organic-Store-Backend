import Testimonial from "../models/testimonials.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

export const createTestimonial = async ({ name, message, photo }) => {
  let photoUrl;

  if (photo && typeof photo === "object") {
    // Multer file object
    photoUrl = await uploadToSupabase(photo);
  } else if (typeof photo === "string" && (photo.startsWith("uploads") || photo.includes("\\"))) {
    // Disk file path
    try {
      photoUrl = await uploadToSupabase(photo);
    } catch {
      photoUrl = photo;
    }
  } else {
    // Existing URL or undefined (model default will apply)
    photoUrl = photo;
  }

  const testimonial = new Testimonial({
    name,
    message,
    ...(photoUrl ? { photo: photoUrl } : {}),
  });

  return await testimonial.save();
};

export const fetchAllTestimonials = async () => {
  return await Testimonial.find();
};
