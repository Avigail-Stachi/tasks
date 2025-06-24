import { Schema, model } from "mongoose";

const productSchema = new Schema({
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: { type: String, required: true, unique: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1 },
});

export const Product = model("Product", productSchema);
