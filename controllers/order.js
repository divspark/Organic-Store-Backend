import * as orderService from "../services/orderService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const newOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;
    const userId = req.user?.id || req.body.user;

    if (!userId) {
      return sendError(res, 400, "User ID is required to place an order");
    }

    if (!products || !products.length) {
      return sendError(res, 400, "Order must contain at least one product");
    }

    const savedOrder = await orderService.createOrder({
      userId,
      products,
      shippingAddress,
    });

    return sendSuccess(res, 201, "Order placed successfully", savedOrder);
  } catch (error) {
    console.error("Order creation failed:", error);
    return sendError(res, 400, "Order creation failed", error);
  }
};

export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { products, shippingAddress, status } = req.body;

  try {
    const updatedOrder = await orderService.updateOrderById(orderId, {
      products,
      shippingAddress,
      status,
    });

    if (!updatedOrder) {
      return sendError(res, 404, "Order not found");
    }

    return sendSuccess(res, 200, "Order updated successfully", updatedOrder);
  } catch (error) {
    console.error("Order update failed:", error);
    return sendError(res, 400, "Order update failed", error);
  }
};

export const fetchOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return sendError(res, 400, "User context is required to fetch orders");
    }

    const orders = await orderService.fetchOrdersByUser(userId);
    return sendSuccess(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    console.error("Fetching orders failed:", error);
    return sendError(res, 500, "Fetching orders failed", error);
  }
};

export const fetchProducerOrders = async (req, res) => {
  try {
    const producerId = req.params.producerId || req.user?.id;

    if (!producerId) {
      return sendError(res, 400, "Producer ID is required");
    }

    const orders = await orderService.fetchOrdersByProducer(producerId);
    return sendSuccess(res, 200, "Producer orders fetched successfully", orders);
  } catch (error) {
    console.error("Fetching producer orders failed:", error);
    return sendError(res, 500, "Fetching producer orders failed", error);
  }
};
