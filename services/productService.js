import Product from "../models/product.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

export const createProduct = async ({
  name,
  price,
  stock,
  category,
  district,
  photo,
  producer,
}) => {
  let photoUrl;
  if (photo) {
    photoUrl = await uploadToSupabase(photo);
  }

  const product = new Product({
    name,
    photo: photoUrl,
    price,
    stock,
    category,
    district,
    producer,
  });

  return await product.save();
};

export const updateProductById = async (id, updateData, photo) => {
  const updates = { ...updateData };

  if (photo) {
    const photoUrl = await uploadToSupabase(photo);
    updates.photo = photoUrl;
  }

  return await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

export const deleteProductById = async (id) => {
  return await Product.findByIdAndDelete(id);
};

export const fetchLatestProducts = async (limit = 6) => {
  return await Product.find({}).sort({ createdAt: -1 }).limit(limit);
};

export const fetchAllCategories = async () => {
  return await Product.distinct("category");
};

export const fetchAllProducts = async (filter = {}) => {
  return await Product.find(filter).sort({ createdAt: -1 });
};

export const fetchProductById = async (id) => {
  return await Product.findById(id).populate("producer", "email district role");
};

export const fetchProductByName = async (name) => {
  return await Product.findOne({
    name: { $regex: name, $options: "i" },
  });
};

export const fetchProductsByDistrict = async (district) => {
  return await Product.find({
    district: { $regex: district, $options: "i" },
  });
};

export const fetchProductsByProducer = async (producerId) => {
  return await Product.find({ producer: producerId }).sort({ createdAt: -1 });
};
