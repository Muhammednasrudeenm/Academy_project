import express from "express";
import { getCommunityPosts, createPost, toggleLikePost, deletePost } from "../controllers/postControllerFirestore.js";
import { getPostComments, createComment, deleteComment } from "../controllers/commentControllerFirestore.js";

const router = express.Router();

console.log("✅ postRoutes.js loaded");

// 🧠 Delete post route - MUST be FIRST to avoid any route conflicts
router.delete("/remove/:postId", deletePost);
console.log("✅ Delete post route registered: DELETE /remove/:postId");

// 🧠 Test route
router.get("/test", (req, res) => {
  res.json({ message: "Post routes working ✅" });
});

// 🧠 Test delete route
router.delete("/test-delete", (req, res) => {
  res.json({ message: "Delete route test working ✅" });
});

// 🧠 Comment routes (must be before :academyId to avoid route conflict)
router.get("/comments/:postId", getPostComments);
router.post("/comments/:postId", createComment);
router.delete("/comments/:commentId", deleteComment);

// 🧠 Like/Unlike post (must be before :academyId to avoid route conflict)
router.post("/like/:postId", toggleLikePost);

// 🧠 Real post routes (MUST be last due to generic :academyId parameter)
router.route("/:academyId/posts")
  .get(getCommunityPosts)
  .post(createPost);

export default router;
