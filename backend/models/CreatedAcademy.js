import mongoose from "mongoose";

const academySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    createdBy: { type: String, default: "dummy_user_id_12345" },
  },
  { timestamps: true }
);

export default mongoose.model("Academy", academySchema);
