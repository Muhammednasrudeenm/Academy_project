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

// CORS configuration for production - VERY PERMISSIVE for mobile compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // In production, allow ALL origins (most permissive for mobile)
    if (process.env.NODE_ENV === 'production') {
      console.log(`[CORS] Allowing origin in production: ${origin || 'no origin'}`);
      return callback(null, true);
    }
    
    // Development: only allow specific origins
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`[CORS] Allowing request with no origin (development)`);
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      // Allow any localhost port for development
      /^http:\/\/localhost:\d+$/,
      // Vercel domains
      /^https?:\/\/.*\.vercel\.app$/,
      /^https?:\/\/.*\.vercel\.app\/.*$/,
      /\.vercel\.app$/,
      // Netlify domains
      /\.netlify\.app$/,
      /^https?:\/\/.*\.netlify\.app$/,
    ].filter(Boolean);
    
    if (allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
    )) {
      console.log(`[CORS] Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
};

// Use CORS with options
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly for mobile
app.options('*', cors(corsOptions));

app.use(express.json());

// ✅ Basic health check
app.get("/", (req, res) => {
  res.json({ 
    message: "🏆 Sports Academy API Running ✅",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    corsEnabled: true
  });
});

// ✅ Debug route (to confirm server is alive)
app.get("/api/debug", (req, res) => {
  res.json({ 
    message: "Server routes working fine ✅",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origin: req.headers.origin || 'no origin',
    corsAllowed: true
  });
});

// ✅ Health check endpoint for mobile testing
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: "enabled",
    message: "Backend is accessible"
  });
});

// ✅ Correct route prefixes
// Debug: Log all requests to /api/posts BEFORE routing
app.use("/api/posts", (req, res, next) => {
  console.log(`[DEBUG POSTS] ${req.method} ${req.originalUrl}`);
  next();
});

// TEMPORARY: Direct route for testing delete post
app.delete("/api/posts/remove/:postId", async (req, res) => {
  console.log(`[DIRECT ROUTE] Delete post called: ${req.params.postId}`);
  try {
    const { deletePost } = await import("./controllers/postControllerFirestore.js");
    return deletePost(req, res);
  } catch (err) {
    console.error("Error in direct route:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use("/api/posts", postRoutes);
app.use("/api/academies", academyRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);

// 🧪 Firebase Test Routes (for testing only - can remove later)
app.use("/api/firebase-test", firebaseTestRoutes);

// ✅ Fallback for undefined routes
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
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
