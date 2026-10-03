import * as productService from "../services/productService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const newProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) {
      return sendError(res, 400, "Please upload a photo");
    }

    if (!name || !price) {
      return sendError(res, 400, "Please enter all required fields");
    }

    const district = req.user?.district || req.body.district || "SampleDistrict";
    const producer = req.user?.id || req.body.producer || undefined;

    const savedProduct = await productService.createProduct({
      name,
      price,
      stock,
      category,
      district,
      photo,
      producer,
    });

    return sendSuccess(res, 201, "Product created successfully", savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return sendError(res, 500, "Failed to create product", error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = req.file;
    const { name, price, stock, category, district } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category) updateData.category = category;
    if (district) updateData.district = district;

    const updatedProduct = await productService.updateProductById(
      id,
      updateData,
      photo
    );

    if (!updatedProduct) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return sendError(res, 500, "Failed to update product", error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProductById(id);

    if (!deletedProduct) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, "Product deleted successfully", { id });
  } catch (error) {
    console.error("Error deleting product:", error);
    return sendError(res, 500, "Failed to delete product", error);
  }
};

export const getLatestProducts = async (req, res) => {
  try {
    const products = await productService.fetchLatestProducts(6);
    return sendSuccess(res, 200, "Latest products fetched successfully", products);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch latest products", error);
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await productService.fetchAllCategories();
    return sendSuccess(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch categories", error);
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await productService.fetchAllProducts();
    return sendSuccess(res, 200, "Admin products fetched successfully", products);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch admin products", error);
  }
};

export const getSingleProducts = async (req, res) => {
  try {
    const product = await productService.fetchProductById(req.params.id);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }
    return sendSuccess(res, 200, "Product fetched successfully", product);
  } catch (error) {
    return sendError(res, 404, "Product not found", error);
  }
};

export const getSingleProductsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const product = await productService.fetchProductByName(name);

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, "Product fetched successfully", product);
  } catch (error) {
    return sendError(res, 500, "Server error while fetching product", error);
  }
};

export const getProductsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    if (!district) {
      return sendError(res, 400, "District parameter is required");
    }

    const products = await productService.fetchProductsByDistrict(district);
    return sendSuccess(
      res,
      200,
      `Products for district '${district}' fetched successfully`,
      products
    );
  } catch (error) {
    return sendError(res, 500, "Failed to fetch products", error);
  }
};

export const getProductsByProducer = async (req, res) => {
  try {
    const producerId = req.params.producerId || req.user?.id;

    if (!producerId) {
      return sendError(res, 400, "Producer ID is required");
    }

    const products = await productService.fetchProductsByProducer(producerId);
    return sendSuccess(res, 200, "Producer products fetched successfully", products);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch producer products", error);
  }
};
