import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sport: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    banner: { type: String },
    createdBy: { type: String, default: "Admin" }
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
