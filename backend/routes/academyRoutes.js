import express from "express";
import upload from "../config/cloudinary.js";
import {
  createAcademy,
  getAllAcademies,
  getAcademyById,
  getMyAcademies,
  getJoinedAcademies,
  toggleJoinAcademy,
} from "../controllers/academyController.js";

const router = express.Router();

// ✅ Always put static routes BEFORE :id routes
router.post(
  "/create",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createAcademy
);

router.get("/", getAllAcademies);
router.get("/user/:userId/created", getMyAcademies);
router.get("/user/:userId/joined", getJoinedAcademies);

// 🚨 IMPORTANT: Restrict :id to only valid ObjectId (24-hex)
router.get("/:id([0-9a-fA-F]{24})", getAcademyById);
router.post("/:id([0-9a-fA-F]{24})/toggle-join", toggleJoinAcademy);

export default router;
