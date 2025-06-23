import express from "express";
import connectDB from "./config/connectDb.js"
import dotnev from "dotenv";
import authRouters from "./routes/auth.js";

dotnev.config();

const server = express();

connectDB();

server.use(express.json());
server.use("/api/auth", authRouters);
server.get("/", (req, res) => res.send("running"));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));
