import Order from "../models/order.js";
import Product from "../models/product.js";

export const createOrder = async ({ userId, products, shippingAddress }) => {
  const totalAmount = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const order = new Order({
    user: userId,
    products,
    shippingAddress,
    totalAmount,
  });

  return await order.save();
};

export const updateOrderById = async (
  orderId,
  { products, shippingAddress, status }
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    return null;
  }

  if (products) {
    order.products = products;
    order.totalAmount = products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  if (shippingAddress) order.shippingAddress = shippingAddress;
  if (status) order.status = status;

  return await order.save();
};

export const fetchOrdersByUser = async (userId) => {
  return await Order.find({ user: userId })
    .populate("products.product", "name price photo category")
    .sort({ createdAt: -1 });
};

export const fetchOrdersByProducer = async (producerId) => {
  // Find all products owned by this producer
  const producerProducts = await Product.find({ producer: producerId }).select("_id");
  const productIds = producerProducts.map((p) => p._id);

  return await Order.find({ "products.product": { $in: productIds } })
    .populate("user", "email district state")
    .populate("products.product", "name price photo category")
    .sort({ createdAt: -1 });
};
