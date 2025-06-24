import { required } from "joi";
import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderNumber: { type: Number, required: true, unique: true },
    products: [orderItemSchema],
    status: {
      type: String,
      required: true,
      enum: ["new", "in progress", "completed"],
      default: "new",
      trim: true,
    },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);
