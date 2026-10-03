import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name"],
      trim: true,
    },
    photo: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Please Enter Price"],
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    producer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// High-performance search & filter indexes
productSchema.index({ name: "text", category: "text" });
productSchema.index({ district: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
