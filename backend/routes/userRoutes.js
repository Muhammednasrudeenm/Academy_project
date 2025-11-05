import express from "express";
import { loginUser } from "../controllers/userControllerFirestore.js";

const router = express.Router();

console.log("✅ userRoutes.js loaded");
console.log("✅ loginUser function:", typeof loginUser);

// Login route with debug logging
router.post("/login", (req, res, next) => {
  console.log(`[USER ROUTE] POST /login called`);
  console.log(`[USER ROUTE] Request body:`, req.body);
  next();
}, loginUser);

export default router;
