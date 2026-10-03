import express from "express";
import { getRecipes } from "../controllers/recipe.js";

const router = express.Router();

router.get("/recipes", getRecipes);
router.get("/", getRecipes);

export default router;
