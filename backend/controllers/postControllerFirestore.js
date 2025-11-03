import * as Post from "../models/PostFirestore.js";
import * as Academy from "../models/AcademyFirestore.js";
import * as User from "../models/UserFirestore.js";

// 🟢 Get all posts for an academy
export const getCommunityPosts = async (req, res) => {
  try {
    const { academyId } = req.params;

    const academy = await Academy.getAcademyById(academyId);
    if (!academy) {
      return res.status(404).json({ message: "Academy not found" });
    }

    const posts = await Post.getPostsByAcademy(academyId);

    // Populate user data
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        if (post.user) {
          try {
            const user = await User.getUserById(post.user);
            post.user = user || { _id: post.user };
          } catch (error) {
            post.user = { _id: post.user };
          }
        }
        return post;
      })
    );

    res.json(postsWithUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Create a new post
export const createPost = async (req, res) => {
  try {
    const { academyId } = req.params;
    const { title, caption, image, video, userId } = req.body;

    const academy = await Academy.getAcademyById(academyId);
    if (!academy) {
      return res.status(404).json({ message: "Academy not found" });
    }

    // Check if user is a member or creator (Firestore IDs are strings)
    const isMember = academy.members?.some(
      (m) => String(m.userId) === String(userId)
    ) || false;
    const isCreator = String(academy.createdBy) === String(userId);

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: "You must be a member to post" });
    }

    const postData = await Post.createPost({
      academy: academyId,
      user: userId,
      title,
      caption,
      image,
      video,
    });

    // Populate user
    try {
      const user = await User.getUserById(userId);
      postData.user = user || { _id: userId };
    } catch (error) {
      postData.user = { _id: userId };
    }

    res.status(201).json(postData);
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

    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);

    const updatedPost = await Post.toggleLikePost(postId, userId);

    res.json({
      success: true,
      liked: !isLiked,
      likes: updatedPost.likes,
      message: isLiked ? "Post unliked" : "Post liked",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

