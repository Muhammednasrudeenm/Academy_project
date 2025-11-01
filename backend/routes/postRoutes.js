import express from "express";
import { getCommunityPosts, createPost } from "../controllers/postController.js";

const router = express.Router();

console.log("✅ postRoutes.js loaded");

// 🧠 Test route
router.get("/test", (req, res) => {
  res.json({ message: "Post routes working ✅" });
});

// 🧠 Real post routes
router.route("/:academyId/posts")
  .get(getCommunityPosts)
  .post(createPost);

export default router;
