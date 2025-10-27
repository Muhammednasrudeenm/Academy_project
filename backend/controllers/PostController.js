import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
};

export const getGroupPosts = async (req, res) => {
  const posts = await Post.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
  res.json(posts);
};
