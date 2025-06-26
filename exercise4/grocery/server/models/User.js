import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const isRequired = function () {
  return this.role === "supplier";
};

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "supplier"],
    required: true,
    trim: true,
  },
  companyName: { type: String, required: isRequired, trim: true },
  phone: { type: String, required: isRequired, trim: true },
  contactName: { type: String, required: isRequired, trim: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    //כשסיסמא חדשה או השתנתה
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.role === "owner") {
    this.companyName = undefined;
    this.phone = undefined;
    this.contactName = undefined;
  }
  next();
});

userSchema.methods.comparePassword = async function (loginPassword) {
  return await bcrypt.compare(loginPassword, this.password);
};

export const User = model("User", userSchema);
