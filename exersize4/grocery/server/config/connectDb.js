import mongoose from "mongoose";
import dotnev from "dotenv";
dotnev.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("there isnt MONGO_URI");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connect to mongoDB");
  } catch (err) {
    console.error(`error connecting to mongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
