import express from "express";
import upload from "../config/cloudinary.js";

const router = express.Router();

router.post("/single", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("✅ Cloudinary upload:", req.file);

    return res.json({
      success: true,
      message: "Image uploaded successfully 🎉",
      imageUrl: req.file.path || req.file.url,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
});

export default router;
