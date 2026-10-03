import express from "express";
import { allTest, newTest } from "../controllers/testimonials.js";
import { uploadPhoto } from "../middleware/multer.js";

const router = express.Router();

router.post("/new", uploadPhoto, newTest);
router.post("/", uploadPhoto, newTest);
router.get("/all", allTest);
router.get("/", allTest);

export default router;