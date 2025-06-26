import { Schema, model } from "mongoose";

const productSchema = new Schema({
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1 },
});
productSchema.index({ supplier: 1, name: 1 }, { unique: true });

export const Product = model("Product", productSchema);
