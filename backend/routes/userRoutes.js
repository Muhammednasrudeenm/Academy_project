import express from "express";
import { loginUser } from "../controllers/userControllerFirestore.js";

const router = express.Router();

console.log("✅ userRoutes.js loaded");
console.log("✅ loginUser function:", typeof loginUser);

// Test route to verify router is working
router.get("/test", (req, res) => {
  console.log(`[USER ROUTE] GET /test called`);
  res.json({ 
    message: "User router is working! ✅",
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
});

// Login route with debug logging
router.post("/login", (req, res, next) => {
  console.log(`[USER ROUTE] POST /login called`);
  console.log(`[USER ROUTE] Request path: ${req.path}`);
  console.log(`[USER ROUTE] Request baseUrl: ${req.baseUrl}`);
  console.log(`[USER ROUTE] Request originalUrl: ${req.originalUrl}`);
  console.log(`[USER ROUTE] Request body:`, req.body);
  next();
}, loginUser);

export default router;
