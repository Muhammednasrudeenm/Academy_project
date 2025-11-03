import Academy from "../models/Academy.js";

// 🟢 Create a new academy
export const createAcademy = async (req, res) => {
  try {
    const { name, category, description, createdBy } = req.body;

    // ✅ Use dummy ID only for local testing
    const creatorId =
      createdBy && createdBy.trim() !== ""
        ? createdBy
        : "6906072fc7707e8d4f7b7f0f"; // <-- valid ObjectId from your User collection

    const logo = req.files?.logo?.[0]?.path || "";
    const banner = req.files?.banner?.[0]?.path || "";

    const academy = new Academy({
      name,
      category,
      description,
      logo,
      banner,
      createdBy: creatorId,
    });

    await academy.save();

    // ✅ Important: add success + message so frontend shows success UI
    res.status(201).json({
      success: true,
      message: "Academy created successfully!",
      data: academy,
    });
  } catch (err) {
    console.error("❌ Error creating academy:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while creating academy.",
    });
  }
};

// 🟢 Get all academies
export const getAllAcademies = async (req, res) => {
  try {
    const academies = await Academy.find().populate("createdBy", "name email");
    res.json({
      success: true,
      data: academies,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get single academy by ID
export const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");
    if (!academy)
      return res.status(404).json({ success: false, message: "Academy not found" });
    res.json({ success: true, data: academy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get academies created by a specific user
export const getMyAcademies = async (req, res) => {
  try {
    const academies = await Academy.find({ createdBy: req.params.userId });
    res.json({ success: true, data: academies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get academies joined by a user
export const getJoinedAcademies = async (req, res) => {
  try {
    const academies = await Academy.find({
      "members.userId": req.params.userId,
    });
    res.json({ success: true, data: academies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Join / Leave Academy
export const toggleJoinAcademy = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const academy = await Academy.findById(id);
    if (!academy)
      return res.status(404).json({ success: false, message: "Academy not found" });

    const isMember = academy.members.some(
      (m) => m.userId.toString() === userId
    );

    if (isMember) {
      academy.members = academy.members.filter(
        (m) => m.userId.toString() !== userId
      );
    } else {
      academy.members.push({ userId });
    }

    await academy.save();
    res.json({
      success: true,
      message: isMember ? "Left academy successfully" : "Joined academy successfully",
      data: academy,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Update Academy
export const updateAcademy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, createdBy } = req.body;

    const academy = await Academy.findById(id);
    if (!academy)
      return res.status(404).json({ success: false, message: "Academy not found" });

    // Check if user is the creator
    if (academy.createdBy.toString() !== createdBy) {
      return res.status(403).json({ success: false, message: "Only the creator can update this academy" });
    }

    // Update fields
    if (name) academy.name = name;
    if (category) academy.category = category;
    if (description) academy.description = description;
    if (req.files?.logo?.[0]?.path) academy.logo = req.files.logo[0].path;
    if (req.files?.banner?.[0]?.path) academy.banner = req.files.banner[0].path;

    await academy.save();
    res.json({
      success: true,
      message: "Academy updated successfully",
      data: academy,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Delete Academy
export const deleteAcademy = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const academy = await Academy.findById(id);
    if (!academy)
      return res.status(404).json({ success: false, message: "Academy not found" });

    // Check if user is the creator
    if (academy.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the creator can delete this academy" });
    }

    // Delete all posts in this academy
    const Post = (await import("../models/post.js")).default;
    await Post.deleteMany({ academy: id });

    // Delete the academy
    await Academy.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Academy deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
