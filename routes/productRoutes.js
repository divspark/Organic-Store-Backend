import express from "express";
import {
  newProduct,
  updateProduct,
  deleteProduct,
  getLatestProducts,
  getAllCategories,
  getAdminProducts,
  getSingleProducts,
  getSingleProductsByName,
  getProductsByDistrict,
  getProductsByProducer,
} from "../controllers/product.js";
import uploadPhoto from "../middleware/multer.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Product Creation (supports authenticated producer or fallback district)
router.post("/new", optionalAuth, uploadPhoto, newProduct);

// Product Update & Deletion
router.put("/:id", optionalAuth, uploadPhoto, updateProduct);
router.delete("/:id", optionalAuth, deleteProduct);

// Product Queries & Catalogs
router.get("/latest", getLatestProducts);
router.get("/categories", getAllCategories);
router.get("/admin-products", getAdminProducts);
router.get("/producer/:producerId", optionalAuth, getProductsByProducer);
router.get("/producer", authMiddleware, getProductsByProducer);
router.get("/district/:district", getProductsByDistrict);
router.get("/name/:name", getSingleProductsByName);
router.get("/:id", getSingleProducts);

export default router;