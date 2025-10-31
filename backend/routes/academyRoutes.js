import express from "express";
import upload from "../config/cloudinary.js";
import {
  createAcademy,
  getAllAcademies,
  getAcademyById,
} from "../controllers/academyController.js";

const router = express.Router();

// Create academy
router.post(
  "/create",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createAcademy
);

// ✅ Get all academies
router.get("/", getAllAcademies);

// ✅ Get single academy by ID
router.get("/:id", getAcademyById);

export default router;
