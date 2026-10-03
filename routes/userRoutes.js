import express from "express";
import {
  GetAllUser,
  HandleUserLogin,
  HandleUserSignup,
  deleteUserByEmail,
  getUserById,
  updateUserById,
  GenerateNewAccessToken,
} from "../controllers/user.js";

const router = express.Router();

// Authentication
router.post("/login", HandleUserLogin);
router.post("/signup", HandleUserSignup);
router.post("/token/refresh", GenerateNewAccessToken);
router.post("/refresh", GenerateNewAccessToken);

// User Profile Queries & Modifications (supports both /user/:id and /:id)
router.get("/user/:id", getUserById);
router.get("/:id", getUserById);
router.put("/user/:id", updateUserById);
router.put("/:id", updateUserById);

// Administration
router.get("/all", GetAllUser);
router.delete("/email/:email", deleteUserByEmail);

export default router;
