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

    // Validate character limits
    const MAX_POST_CAPTION = 20000;
    const MAX_POST_TITLE = 500;
    
    if (caption && caption.length > MAX_POST_CAPTION) {
      return res.status(400).json({ message: `Post caption cannot exceed ${MAX_POST_CAPTION} characters` });
    }
    
    if (title && title.length > MAX_POST_TITLE) {
      return res.status(400).json({ message: `Post title cannot exceed ${MAX_POST_TITLE} characters` });
    }

    const postData = await Post.createPost({
      academy: academyId,
      user: userId,
      title: title?.trim(),
      caption: caption?.trim(),
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

// 🟢 Delete a post
export const deletePost = async (req, res) => {
  try {
    console.log("========== DELETE POST CONTROLLER CALLED ==========");
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Original URL:", req.originalUrl);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("===================================================");
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      console.log("Delete post: Missing userId");
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    console.log("Delete post: Fetching post", postId);
    const post = await Post.getPostById(postId);
    if (!post) {
      console.log("Delete post: Post not found", postId);
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user is the post creator
    // Handle both cases: post.user might be a string (ID) or an object with _id
    const postUserId = post.user?._id || post.user;
    console.log("Delete post: Comparing users", { postUserId, userId, match: String(postUserId) === String(userId) });
    if (String(postUserId) !== String(userId)) {
      console.log("Delete post: User not authorized", { postUserId, userId });
      return res.status(403).json({ success: false, message: "Only the post creator can delete this post" });
    }

    console.log("Delete post: Deleting post", postId);
    await Post.deletePost(postId);

    console.log("Delete post: Success");
    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

