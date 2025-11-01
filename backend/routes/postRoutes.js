import express from "express";
import { getCommunityPosts, createPost } from "../controllers/postController.js";

const router = express.Router();

console.log("✅ postRoutes.js loaded"); // Must appear in terminal when server starts

router.get("/test", (req, res) => {
  res.json({ message: "Post routes working ✅" });
});

router.route("/:academyId/posts")
  .get(getCommunityPosts)
  .post(createPost);

export default router;
