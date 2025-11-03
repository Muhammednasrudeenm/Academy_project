import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    academy: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    caption: String,
    image: String,
    video: String,
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
