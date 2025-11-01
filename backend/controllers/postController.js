import Post from "../models/post.js";
import Academy from "../models/Academy.js";

// 🟢 Get all posts for an academy
export const getCommunityPosts = async (req, res) => {
  try {
    const { academyId } = req.params;

    const academy = await Academy.findById(academyId);
    if (!academy) return res.status(404).json({ message: "Academy not found" });

    const posts = await Post.find({ academy: academyId })
      .populate("user", "name profilePic")
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

    const post = await Post.create({
      academy: academyId,
      user: userId,
      title,
      caption,
      image,
      video,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
