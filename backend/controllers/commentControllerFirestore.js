import * as Comment from "../models/CommentFirestore.js";
import * as Post from "../models/PostFirestore.js";
import * as User from "../models/UserFirestore.js";

// 🟢 Get all comments for a post
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.getCommentsByPost(postId);

    // Populate user data
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        if (comment.user) {
          try {
            const user = await User.getUserById(comment.user);
            comment.user = user || { _id: comment.user };
          } catch (error) {
            comment.user = { _id: comment.user };
          }
        }
        return comment;
      })
    );

    res.json(commentsWithUsers);
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

    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const commentData = await Comment.createComment({
      post: postId,
      user: userId,
      text: text.trim(),
    });

    // Update post comment count
    await Post.incrementCommentCount(postId);

    // Populate user
    try {
      const user = await User.getUserById(userId);
      commentData.user = user || { _id: userId };
    } catch (error) {
      commentData.user = { _id: userId };
    }

    res.status(201).json(commentData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner (Firestore IDs are strings)
    if (String(comment.user) !== String(userId)) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    // Update post comment count
    const post = await Post.getPostById(comment.post);
    if (post) {
      await Post.decrementCommentCount(comment.post);
    }

    await Comment.deleteComment(commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

