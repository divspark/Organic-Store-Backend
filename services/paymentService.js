import stripe from "stripe";
import { config as dotenvConfig } from "dotenv";
import Order from "../models/order.js";

dotenvConfig();

const STRIPE_KEY = process.env.STRIPE_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripeClient = stripe(STRIPE_KEY);

export const createStripePaymentIntent = async ({ amount, currency = "inr", orderId }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe requires amount in paise/cents
    currency,
    metadata: {
      orderId,
      user: order.user.toString(),
    },
  });

  return paymentIntent;
};

export const verifyAndCompletePayment = async ({ paymentId, orderId }) => {
  const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentId);
  if (!paymentIntent || paymentIntent.status !== "succeeded") {
    const error = new Error("Payment not completed");
    error.statusCode = 400;
    throw error;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentId,
      status: "Paid",
    },
    { new: true }
  );

  if (!updatedOrder) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return updatedOrder;
};

/**
 * Handles incoming Stripe webhooks with signature verification and event idempotency.
 * @param {Object} params
 * @param {Buffer|string} params.rawBody - Raw request body
 * @param {string} params.signature - stripe-signature header value
 * @returns {Promise<Object>} Processed result status
 */
export const handleStripeWebhook = async ({ rawBody, signature }) => {
  let event;

  // 1. Signature verification & Event construction
  if (STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripeClient.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = new Error(`Webhook Signature Verification Failed: ${err.message}`);
      error.statusCode = 400;
      throw error;
    }
  } else {
    // In local dev/testing without webhook secret configured
    if (typeof rawBody === "string" || Buffer.isBuffer(rawBody)) {
      try {
        event = JSON.parse(rawBody.toString());
      } catch {
        event = rawBody;
      }
    } else {
      event = rawBody;
    }
  }

  if (!event || !event.type) {
    const error = new Error("Invalid Stripe event payload");
    error.statusCode = 400;
    throw error;
  }

  const eventId = event.id;

  // 2. Handle specific event types with idempotency
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        return {
          received: true,
          message: "PaymentIntent without orderId metadata acknowledged.",
        };
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return {
          received: true,
          message: `Order ${orderId} not found, event acknowledged.`,
        };
      }

      // Idempotency check: Already processed this event or already marked Paid with this payment intent
      const isAlreadyProcessed =
        (eventId && order.processedWebhookEvents?.includes(eventId)) ||
        (order.status === "Paid" && order.paymentId === paymentIntent.id);

      if (isAlreadyProcessed) {
        return {
          received: true,
          idempotent: true,
          message: `Event ${eventId || ""} for Order ${orderId} already processed.`,
        };
      }

      // Update order state
      order.status = "Paid";
      order.paymentId = paymentIntent.id;
      if (eventId) {
        order.processedWebhookEvents = order.processedWebhookEvents || [];
        order.processedWebhookEvents.push(eventId);
      }
      await order.save();

      return {
        received: true,
        idempotent: false,
        message: `Order ${orderId} payment succeeded and status updated to Paid.`,
      };
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        return { received: true, message: "No orderId metadata found." };
      }

      const order = await Order.findById(orderId);
      if (order && order.status !== "Paid") {
        if (eventId && order.processedWebhookEvents?.includes(eventId)) {
          return {
            received: true,
            idempotent: true,
            message: `Failure event ${eventId} already recorded for Order ${orderId}.`,
          };
        }

        order.status = "payment_failed";
        if (eventId) {
          order.processedWebhookEvents = order.processedWebhookEvents || [];
          order.processedWebhookEvents.push(eventId);
        }
        await order.save();
      }

      return {
        received: true,
        message: `Payment failed handled for Order ${orderId}.`,
      };
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;

      const order = await Order.findOne({ paymentId: paymentIntentId });
      if (order) {
        order.status = "cancelled";
        if (eventId) {
          order.processedWebhookEvents = order.processedWebhookEvents || [];
          order.processedWebhookEvents.push(eventId);
        }
        await order.save();
      }

      return {
        received: true,
        message: "Refund processed.",
      };
    }

    default:
      return {
        received: true,
        message: `Unhandled event type ${event.type}`,
      };
  }
};
