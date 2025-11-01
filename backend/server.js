import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import academyRoutes from "./routes/academyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/PostRoutes.js";

dotenv.config();
connectDB();

console.log("✅ Server starting...");
console.log("📦 Routes imported:", {
  postRoutes: !!postRoutes,
  academyRoutes: !!academyRoutes,
});

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Basic health check
app.get("/", (req, res) => {
  res.send("🏆 Sports Academy API Running ✅");
});

// ✅ Debug route (to confirm server is alive)
app.get("/api/debug", (req, res) => {
  res.json({ message: "Server routes working fine ✅" });
});

// ✅ Correct route prefixes
app.use("/api/posts", postRoutes);
app.use("/api/academies", academyRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);

// ✅ Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found 🚫" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
