import express from "express";
import morgan from "morgan";
import ConnectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import ocrRoutes from "./routes/ocrRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
ConnectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URI || "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/ocr", ocrRoutes);
app.use("/api1/auth", authRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
