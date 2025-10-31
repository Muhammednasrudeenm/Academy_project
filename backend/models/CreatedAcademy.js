import mongoose from "mongoose";

const academySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },

    // ✅ Reference the User who created this academy
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Members / Joined Users
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Academy", academySchema);
