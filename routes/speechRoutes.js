import express from "express";
import { voiceReco } from "../controllers/speech.js";

const router = express.Router();

// Support both GET and POST for flexible client consumption
router.get("/new", voiceReco);
router.post("/new", voiceReco);
router.get("/", voiceReco);
router.post("/", voiceReco);
router.get("/query", voiceReco);
router.post("/query", voiceReco);

export default router;