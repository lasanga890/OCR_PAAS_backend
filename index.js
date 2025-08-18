import express from "express";
import morgan from "morgan";
import ConnectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import ocrRoutes from "./routes/ocrRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/verifyToken.js";

dotenv.config();

const app = express();

ConnectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URI || "http://localhost:8080", // Update to match your frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/ocr", ocrRoutes);
app.use("/api1/auth", authRoutes);

app.get("/api1/test", verifyToken, (req, res) => {
  res.json({ success: true, message: "Protected API works!", user: req.user });
});

const PORT = process.env.PORT || 5000; // Match your backend port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
