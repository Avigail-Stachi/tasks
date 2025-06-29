import { Schema, model } from "mongoose";

const counterSchema = Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
export const Counter = model("Counter", counterSchema);
