import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID || "3af8e7b0";
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY || "53960c6db1db5e04384a66cbf7f1ea8d";

const fallbackRecipes = [
  {
    name: "Farm Fresh Organic Tomato Soup",
    url: "https://example.com/recipes/organic-tomato-soup",
    ingredients: [
      "1 kg organic ripe tomatoes",
      "2 cloves fresh garlic",
      "1 tbsp cold-pressed olive oil",
      "Fresh basil leaves",
      "Pinch of sea salt and black pepper",
    ],
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    calories: 180,
  },
  {
    name: "Crispy Roasted Herb Potatoes",
    url: "https://example.com/recipes/roasted-potatoes",
    ingredients: [
      "500g baby organic potatoes",
      "2 sprigs fresh rosemary",
      "2 tbsp olive oil",
      "Sea salt and crushed paprika",
    ],
    image:
      "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80",
    calories: 220,
  },
  {
    name: "Garden Green Salad with Honey-Mustard Dressing",
    url: "https://example.com/recipes/garden-salad",
    ingredients: [
      "Mixed organic greens (spinach, arugula, lettuce)",
      "1 cucumber, thinly sliced",
      "Cherry tomatoes",
      "Organic lemon juice & cold pressed oil",
    ],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    calories: 140,
  },
  {
    name: "Organic Vegetable Biryani Bowl",
    url: "https://example.com/recipes/veg-biryani",
    ingredients: [
      "Basmati rice",
      "Carrots, green peas, cauliflower",
      "Biryani whole spices (cardamom, clove, cinnamon)",
      "Saffron infused warm milk",
    ],
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    calories: 380,
  },
];

export const fetchRecipesFromEdamam = async ({
  query = "chicken",
  diet = "balanced",
  calories = "591-722",
  allergy = "alcohol-free",
  cuisine = "indian",
}) => {
  try {
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(
      query
    )}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&cuisineType=${encodeURIComponent(
      cuisine
    )}`;

    const response = await axios.get(url, { timeout: 4000 });

    if (response.data?.hits && response.data.hits.length > 0) {
      return response.data.hits.map((hit) => ({
        name: hit.recipe.label,
        url: hit.recipe.url,
        ingredients: hit.recipe.ingredientLines,
        image: hit.recipe.image,
        calories: Math.round(hit.recipe.calories || 0),
      }));
    }
  } catch (err) {
    console.warn("Edamam API fetch fallback:", err.message);
  }

  // Filter or return curated organic recipes fallback
  const filtered = fallbackRecipes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.ingredients.some((i) => i.toLowerCase().includes(query.toLowerCase()))
  );

  return filtered.length > 0 ? filtered : fallbackRecipes;
};
