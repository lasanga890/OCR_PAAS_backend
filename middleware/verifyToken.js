import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user; // Store user in request for downstream handlers
    next(); // Proceed to the route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
