import * as paymentService from "../services/paymentService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// 1. Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  const { amount, currency = "inr", orderId } = req.body;

  if (!amount || !orderId) {
    return sendError(res, 400, "Amount and Order ID are required");
  }

  try {
    const paymentIntent = await paymentService.createStripePaymentIntent({
      amount,
      currency,
      orderId,
    });

    return sendSuccess(res, 201, "Payment intent created successfully", {
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, 404, error.message);
    }
    console.error("Stripe PaymentIntent error:", error);
    return sendError(res, 500, "Error creating payment intent", error);
  }
};

// 2. Update Order After Payment (Manual Client Callback)
export const updateOrderAfterPayment = async (req, res) => {
  const { paymentId, orderId } = req.body;

  if (!paymentId || !orderId) {
    return sendError(res, 400, "Payment ID and Order ID are required");
  }

  try {
    const updatedOrder = await paymentService.verifyAndCompletePayment({
      paymentId,
      orderId,
    });

    return sendSuccess(
      res,
      200,
      "Order payment status updated successfully",
      updatedOrder
    );
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404) {
      return sendError(res, 404, error.message);
    }
    console.error("Error updating order after payment:", error);
    return sendError(res, 500, "Error updating order after payment", error);
  }
};

// 3. Stripe Webhook Handler (Automated & Idempotent)
export const handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const rawBody = req.rawBody || req.body;

  try {
    const result = await paymentService.handleStripeWebhook({
      rawBody,
      signature,
    });

    return sendSuccess(res, 200, result.message || "Webhook processed successfully", result);
  } catch (error) {
    console.error("Stripe Webhook processing error:", error.message);
    return sendError(res, error.statusCode || 400, error.message, error);
  }
};
