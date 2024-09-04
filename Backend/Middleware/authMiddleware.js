import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const parentMiddleware = async (req, res, next) => {
  if (req.user && req.user.UserType === "parent") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied, only parents are allowed" });
  }
};
