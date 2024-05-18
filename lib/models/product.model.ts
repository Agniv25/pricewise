import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    url: { type: String, unique: true },
    currency: { type: String },
    image: { type: String },
    title: { type: String },
    currentPrice: { type: Number },
    originalPrice: { type: Number },
    priceHistory: [
      {
        price: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    isOutOfStock: { type: Boolean, default: false },
    users: [{ email: { type: String } }],
    website: { type: String },
    stars: { type: Number },
    default: [],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
