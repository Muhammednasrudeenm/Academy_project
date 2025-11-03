import express from "express";
import { getCommunityPosts, createPost, toggleLikePost } from "../controllers/postControllerFirestore.js";
import { getPostComments, createComment, deleteComment } from "../controllers/commentControllerFirestore.js";

const router = express.Router();

console.log("✅ postRoutes.js loaded");

// 🧠 Test route
router.get("/test", (req, res) => {
  res.json({ message: "Post routes working ✅" });
});

// 🧠 Like/Unlike post (must be before :academyId to avoid route conflict)
router.post("/like/:postId", toggleLikePost);

// 🧠 Comment routes (must be before :academyId to avoid route conflict)
router.get("/comments/:postId", getPostComments);
router.post("/comments/:postId", createComment);
router.delete("/comments/:commentId", deleteComment);

// 🧠 Real post routes
router.route("/:academyId/posts")
  .get(getCommunityPosts)
  .post(createPost);

export default router;
