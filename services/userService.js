import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const secretKey = process.env.JWT_SECRET || "Dabbemein4098";
const refreshKey = process.env.REFRESH_SECRET || "yourRefreshSecretKey";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, district: user.district },
    secretKey,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    refreshKey,
    { expiresIn: "7d" }
  );
};

export const authenticateUser = async ({ email, password, role, district }) => {
  const user = await User.findOne({ email, role, district });
  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const registerUser = async ({ email, password, role, district, state }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    role,
    district,
    state,
  });

  await newUser.save();

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  return { user: newUser, accessToken, refreshToken };
};

export const findUserById = async (id) => {
  return await User.findById(id).select("-password");
};

export const findAllUsers = async () => {
  return await User.find({});
};

export const updateUser = async (id, updateData) => {
  const updates = {};
  if (updateData.email) updates.email = updateData.email;
  if (updateData.district) updates.district = updateData.district;
  if (updateData.state) updates.state = updateData.state;
  if (updateData.role) updates.role = updateData.role;

  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updates.password = hashedPassword;
  }

  return await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
    context: "query",
  }).select("-password");
};

export const removeUserByEmail = async (email) => {
  return await User.findOneAndDelete({ email });
};

export const refreshUserToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, refreshKey);
  const user = await User.findById(decoded.id);
  if (!user) {
    return null;
  }
  const newAccessToken = generateAccessToken(user);
  return { user, newAccessToken };
};
