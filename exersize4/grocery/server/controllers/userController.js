import { User } from "../models/User.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js"

// בקשת פוסט להוספת משתמש
export const registerUser = async (req, res) => {
  const { userName, password, role, companyName, phone, contactName } =
    req.validatedBody;
  try {
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
      res.json({
        _id: user._id,
        userName: user.userName,
        role: user.role,
        token: generateToken(user),
      });
    } else res.status(401).json({ msg: "invalid username or password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};
