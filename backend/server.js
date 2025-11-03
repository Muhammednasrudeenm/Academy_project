import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// MongoDB connection (commented out - using Firebase now)
// import connectDB from "./config/db.js";
// Initialize Firebase
import "./config/firebase.js";

import academyRoutes from "./routes/academyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import firebaseTestRoutes from "./routes/firebaseTestRoutes.js";

dotenv.config();
// MongoDB connection disabled - using Firebase now
// connectDB();
console.log("🔥 Using Firebase Firestore as database");

console.log("✅ Server starting...");
console.log("📦 Routes imported:", {
  postRoutes: !!postRoutes,
  academyRoutes: !!academyRoutes,
});

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      // Vercel preview deployments
      /\.vercel\.app$/,
      /\.netlify\.app$/,
    ].filter(Boolean);
    
    if (allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Use CORS with options
app.use(cors(corsOptions));
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

// 🧪 Firebase Test Routes (for testing only - can remove later)
app.use("/api/firebase-test", firebaseTestRoutes);

// ✅ Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found 🚫" });
});

const PORT = process.env.PORT || 5000;

// Handle port already in use error
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log(`💡 Try one of these solutions:`);
    console.log(`   1. Stop the other process using port ${PORT}`);
    console.log(`   2. Change PORT in .env file to a different number (e.g., 5001)`);
    console.log(`   3. Find and kill the process: netstat -ano | findstr :${PORT}`);
    process.exit(1);
  }
});
