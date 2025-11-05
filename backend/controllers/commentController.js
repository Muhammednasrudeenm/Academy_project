import Comment from "../models/Comment.js";
import Post from "../models/post.js";

// 🟢 Get all comments for a post
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Create a new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, userId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create comment
    const comment = await Comment.create({
      post: postId,
      user: userId,
      text: text.trim(),
    });

    // Update post comment count
    post.comments = (post.comments || 0) + 1;
    await post.save();

    // Populate and return
    const populatedComment = await Comment.findById(comment._id).populate("user", "name email");

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user is the comment owner
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    // Update post comment count
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = Math.max(0, (post.comments || 0) - 1);
      await post.save();
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







