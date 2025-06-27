import jwt from "jsonwebtoken";

//פונקצית עזר ליצירת טוקן
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

// פונקציה ליצירת טוקן לטווח ארוך
export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// export default generateToken
