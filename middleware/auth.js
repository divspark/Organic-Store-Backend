import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendError } from "../utils/apiResponse.js";

const secretKey = process.env.JWT_SECRET || "Dabbemein4098";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    return sendError(res, 401, "Access token missing.");
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      district: decoded.district || user.district,
    };
    next();
  } catch (error) {
    return sendError(res, 403, "Invalid or expired token.", error);
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        district: decoded.district || user.district,
      };
    }
  } catch {
    // Ignore invalid token in optional auth
  }

  next();
};

export const authenticateToken = authMiddleware;

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return sendError(res, 403, `Access denied. Requires ${role} role.`);
    }
    next();
  };
};

export default {
  authMiddleware,
  optionalAuth,
  authenticateToken,
  requireRole,
};
