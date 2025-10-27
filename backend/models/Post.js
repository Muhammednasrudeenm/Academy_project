import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    author: { type: String, default: "Anonymous" },
    authorAvatar: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
