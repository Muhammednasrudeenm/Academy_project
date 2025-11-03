import express from "express";
import upload from "../config/cloudinary.js";
import {
  createAcademy,
  getAllAcademies,
  getAcademyById,
  getMyAcademies,
  getJoinedAcademies,
  toggleJoinAcademy,
  updateAcademy,
  deleteAcademy,
} from "../controllers/academyControllerFirestore.js";

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

// ✅ Firestore uses alphanumeric IDs (not ObjectId format)
router.get("/:id", getAcademyById);
router.post("/:id/toggle-join", toggleJoinAcademy);
router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateAcademy
);
router.delete("/:id", deleteAcademy);

export default router;
