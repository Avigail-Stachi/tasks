import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken,generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  const { userName, password, role, companyName, phone, contactName } =
    req.validatedBody;

  try {
    const userExists = await User.findOne({ userName });
    if (userExists) {
      return res.status(409).json({
        msg: "this username is already exists. try choosing a different name",
      });
    }

    const user = await User.create({
      userName,
      password,
      role,
      companyName,
      phone,
      contactName,
    });

    if (user) {
      res.status(201).json({
        msg: `User ${user.userName} with role ${user.role} created successfully.`,
      });
    } else {
      res.status(400).json({ msg: "Invalid user details" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};

// בקשת פוסט להוספת משתמש
export const registerUser = async (req, res) => {
  const { userName, password, role, companyName, phone, contactName } =
    req.validatedBody;
  try {
    if (role === "owner") {
      const ownerExists = await User.findOne({ role: "owner" });
      if (ownerExists) {
        return res.status(403).json({
          msg: "An owner user already exists. Cannot register another owner",
        });
      }
    }
    const userExists = await User.findOne({ userName });
    if (userExists)
      return res.status(409).json({
        msg: "this username is already exists. try choosing a different name",
      });
    const user = await User.create({
      userName,
      password, //-יעבור גיבוב ב pre
      role,
      companyName,
      phone,
      contactName,
    });
    if (user)
      res.status(201).json({
        msg: "user registered successfully. please log in",
        userName: user.userName, // כדי לעשות מילוי אוטמטי
      });
    else res.status(400).json({ msg: "invalid user details" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};

//כניסה למערכת
export const loginUser = async (req, res) => {
  const { userName, password } = req.validatedBody;
  try {
    const user = await User.findOne({ userName });
    if (user && (await user.comparePassword(password))) {
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save(); 
      res.json({
        _id: user._id,
        userName: user.userName,
        role: user.role,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else res.status(401).json({ msg: "invalid username or password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};

export const refreshToken = async (req, res) => {
  const {refreshToken:incomingRefreshToken} = req.body;
  if (!incomingRefreshToken) {
    return res.status(401).json({ msg: "No refresh token provided" });
  }
  try {
    const user = await User.findOne({ refreshToken: incomingRefreshToken });
    if (!user) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }
    jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("Refresh token verification failed:", err);
        user.refreshToken = null;
        user.save();
        return res.status(403).json({ msg: "Invalid or expired refresh token" });
      }
      if(user._id.toString() !== decoded.id) {
        return res.status(403).json({ msg: "Invalid user for this refresh token" });
      }
      const newAccessToken = generateToken(user);
      res.json({
        accessToken: newAccessToken});
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  const {refreshToken:incomingRefreshToken} = req.body;
  if (!incomingRefreshToken) {
    return res.status(401).json({ msg: "No refresh token provided" });
  }

  try {
    const user = await User.findOne({ refreshToken: incomingRefreshToken });
    if (user) {
      user.refreshToken = null; // לאפס את הטוקן
      await user.save();
    }
    res.status(200).json({ msg: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ msg: "Server error" });
  }
}
