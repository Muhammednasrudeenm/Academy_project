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
    
    // Cloudinary returns the URL in different properties
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    
    if (!imageUrl) {
      console.error("❌ No URL in file object:", req.file);
      return res.status(500).json({
        success: false,
        message: "Upload succeeded but no URL returned",
      });
    }

    return res.json({
      success: true,
      message: "Image uploaded successfully 🎉",
      imageUrl: imageUrl,
      secure_url: imageUrl, // Also return as secure_url for compatibility
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
