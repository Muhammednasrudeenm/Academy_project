import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// Get posts for a group
router.get("/:groupId/posts", async (req, res) => {
  const posts = await Post.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
  res.json(posts);
});

// Create post in a group
router.post("/:groupId/posts", async (req, res) => {
  const { content, author, authorAvatar } = req.body;
  const post = await Post.create({
    groupId: req.params.groupId,
    content,
    author,
    authorAvatar,
  });
  res.status(201).json(post);
});

export default router;
