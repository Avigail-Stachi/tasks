import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema({
  supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: [orderItemSchema],
  status:{type:String,enum:['new','in progress','completed'],default:'new', trim:true}
});

export const Order = model("Order", orderSchema);
