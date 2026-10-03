import * as userService from "../services/userService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const HandleUserLogin = async (req, res) => {
  try {
    const { email, password, role, district } = req.body;

    const authResult = await userService.authenticateUser({
      email,
      password,
      role,
      district,
    });

    if (!authResult) {
      return sendError(res, 401, "Invalid credentials");
    }

    const { user, accessToken, refreshToken } = authResult;

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, 200, `Login successful as ${role}`, {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        district: user.district,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Server error", error);
  }
};

export const HandleUserSignup = async (req, res) => {
  const { email, password, role, district, state } = req.body;

  try {
    const signupResult = await userService.registerUser({
      email,
      password,
      role,
      district,
      state,
    });

    const { user, accessToken, refreshToken } = signupResult;

    // Set tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, 201, "User created successfully", {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        district: user.district,
        state: user.state,
      },
    });
  } catch (error) {
    if (error.statusCode === 400 || error.message === "User already exists") {
      return sendError(res, 400, "User already exists");
    }
    console.error("Signup Error:", error);
    return sendError(res, 500, "Server error", error);
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.findUserById(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    return sendSuccess(res, 200, "User fetched successfully", user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return sendError(res, 500, "Server error", error);
  }
};

export const GetAllUser = async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    return sendSuccess(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch users", error);
  }
};

export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { email, password, district, state, role } = req.body;

  try {
    const updatedUser = await userService.updateUser(id, {
      email,
      password,
      district,
      state,
      role,
    });

    if (!updatedUser) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return sendError(res, 500, "Server error", error);
  }
};

export const deleteUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await userService.removeUserByEmail(email);
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    return sendSuccess(res, 200, "User deleted successfully", { email });
  } catch (error) {
    return sendError(res, 500, "Failed to delete user", error);
  }
};

export const GenerateNewAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return sendError(res, 401, "Refresh token missing");
  }

  try {
    const refreshResult = await userService.refreshUserToken(refreshToken);
    if (!refreshResult) {
      return sendError(res, 403, "User not found");
    }

    const { user, newAccessToken } = refreshResult;

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return sendSuccess(res, 200, "Access token refreshed", {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return sendError(res, 403, "Invalid refresh token", error);
  }
};
