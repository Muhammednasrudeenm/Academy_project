import Post from "../models/post.js";
import Academy from "../models/Academy.js";

// 🟢 Get all posts for an academy
export const getCommunityPosts = async (req, res) => {
  try {
    const { academyId } = req.params;

    const academy = await Academy.findById(academyId);
    if (!academy) return res.status(404).json({ message: "Academy not found" });

    const posts = await Post.find({ academy: academyId })
      .populate("user", "name email")
      .populate("likedBy", "_id")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Create a new post
export const createPost = async (req, res) => {
  try {
    const { academyId } = req.params;
    const { title, caption, image, video, userId } = req.body;

    const academy = await Academy.findById(academyId);
    if (!academy) return res.status(404).json({ message: "Academy not found" });

    // Check if user is a member or creator
    const isMember = academy.members.some(
      (m) => m.userId.toString() === userId
    );
    const isCreator = academy.createdBy.toString() === userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: "You must be a member to post" });
    }

    const post = await Post.create({
      academy: academyId,
      user: userId,
      title,
      caption,
      image,
      video,
    });

    const populatedPost = await Post.findById(post._id).populate("user", "name email");

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Toggle like on a post
export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likedBy.some((id) => id.toString() === userId);

    if (isLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = post.likes + 1;
    }

    await post.save();
    res.json({
      success: true,
      liked: !isLiked,
      likes: post.likes,
      message: isLiked ? "Post unliked" : "Post liked",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
