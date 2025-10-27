import express from "express";
import Group from "../models/Group.js";

const router = express.Router();

// Get all groups
router.get("/", async (req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 });
  res.json(groups);
});

// Create new group
router.post("/", async (req, res) => {
  const { name, sport, description, logo, banner } = req.body;
  const group = await Group.create({ name, sport, description, logo, banner });
  res.status(201).json(group);
});

// Get single group
router.get("/:id", async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });
  res.json(group);
});

export default router;
