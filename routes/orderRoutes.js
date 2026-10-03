import express from "express";
import {
  fetchOrder,
  newOrder,
  updateOrder,
  fetchProducerOrders,
} from "../controllers/order.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Order Creation
router.post("/new", optionalAuth, newOrder);

// Order Listing (for user and producer)
router.get("/all", authMiddleware, fetchOrder);
router.get("/user/:userId", optionalAuth, fetchOrder);
router.get("/producer/:producerId", optionalAuth, fetchProducerOrders);
router.get("/producer", authMiddleware, fetchProducerOrders);

// Order Updates
router.put("/update/:orderId", updateOrder);
router.put("/:orderId", updateOrder);

export default router;