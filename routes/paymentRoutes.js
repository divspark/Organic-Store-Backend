import express from "express";
import {
  createPaymentIntent,
  updateOrderAfterPayment,
  handleWebhook,
} from "../controllers/payment.js";

const app = express.Router();

// Stripe Webhook Endpoint (uses raw body parser for signature validation)
app.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Payment Intent & Manual Callback Endpoints
app.post("/pay", createPaymentIntent);
app.post("/callback", updateOrderAfterPayment);

export default app;
