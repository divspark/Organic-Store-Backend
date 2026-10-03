import * as recipeService from "../services/recipeService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getRecipes = async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase() : "chicken";
    const diet = req.query.diet ? req.query.diet.toLowerCase() : "balanced";
    const calories = req.query.calories || "591-722";
    const allergy = req.query.health ? req.query.health.toLowerCase() : "alcohol-free";
    const cuisine = req.query.cuisine ? req.query.cuisine.toLowerCase() : "indian";

    const recipes = await recipeService.fetchRecipesFromEdamam({
      query,
      diet,
      calories,
      allergy,
      cuisine,
    });

    return sendSuccess(res, 200, "Recipes fetched successfully", recipes);
  } catch (error) {
    console.error("Recipe fetching error:", error);
    return sendError(res, 500, "Internal Server Error", error);
  }
};
