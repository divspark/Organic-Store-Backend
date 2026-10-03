import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import speechRoutes from "./routes/speechRoutes.js";
import testimonialsRoutes from "./routes/testimonialsRoutes.js";
import { sendSuccess, sendError } from "./utils/apiResponse.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS Configuration
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  "http://localhost:3000,http://localhost:5173,https://grow-frontend-lime.vercel.app"
).split(",");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "stripe-signature"],
};

// Global Middleware
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Database Connection
connectDB();

// API Routes
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/recipe", recipeRoutes);
app.use("/speech", speechRoutes);
app.use("/testimonials", testimonialsRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  return sendSuccess(res, 200, "Organic Store Backend API is live and operational");
});

// 404 Not Found Catch-all
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  return sendError(
    res,
    err.statusCode || 500,
    err.message || "Internal Server Error",
    err
  );
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;
