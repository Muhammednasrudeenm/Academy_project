import * as Academy from "../models/AcademyFirestore.js";
import * as User from "../models/UserFirestore.js";

// 🟢 Create a new academy
export const createAcademy = async (req, res) => {
  try {
    const { name, category, description, createdBy } = req.body;

    const creatorId =
      createdBy && createdBy.trim() !== ""
        ? createdBy
        : null; // You'll need to get this from Firebase Auth

    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message: "Creator ID is required",
      });
    }

    const logo = req.files?.logo?.[0]?.path || "";
    const banner = req.files?.banner?.[0]?.path || "";

    const academy = await Academy.createAcademy({
      name,
      category,
      description,
      logo,
      banner,
      createdBy: creatorId,
    });

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
    const academies = await Academy.getAllAcademies();
    
    // Optimize: Batch fetch all unique creator IDs first
    const creatorIds = [...new Set(academies.map(a => a.createdBy).filter(Boolean))];
    
    // Batch fetch all creators in parallel (much faster than N queries)
    const creatorsMap = new Map();
    if (creatorIds.length > 0) {
      await Promise.all(
        creatorIds.map(async (creatorId) => {
          try {
            const creator = await User.getUserById(creatorId);
            if (creator) {
              creatorsMap.set(creatorId, creator);
            }
          } catch (error) {
            // Silently fail - will use placeholder
          }
        })
      );
    }
    
    // Populate createdBy from cache (no additional queries)
    const academiesWithCreator = academies.map((academy) => {
      if (academy.createdBy) {
        academy.createdBy = creatorsMap.get(academy.createdBy) || { _id: academy.createdBy };
      }
      return academy;
    });

    res.json({
      success: true,
      data: academiesWithCreator,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get single academy by ID
export const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.getAcademyById(req.params.id);
    
    if (!academy) {
      return res.status(404).json({ 
        success: false, 
        message: "Academy not found" 
      });
    }

    // Populate createdBy
    if (academy.createdBy) {
      try {
        const creator = await User.getUserById(academy.createdBy);
        academy.createdBy = creator || { _id: academy.createdBy };
      } catch (error) {
        academy.createdBy = { _id: academy.createdBy };
      }
    }

    // Populate members
    if (academy.members && academy.members.length > 0) {
      academy.members = await Promise.all(
        academy.members.map(async (member) => {
          try {
            const user = await User.getUserById(member.userId);
            return {
              ...member,
              userId: user || { _id: member.userId },
            };
          } catch (error) {
            return {
              ...member,
              userId: { _id: member.userId },
            };
          }
        })
      );
    }

    res.json({ success: true, data: academy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get academies created by a specific user
export const getMyAcademies = async (req, res) => {
  try {
    const academies = await Academy.getMyAcademies(req.params.userId);
    res.json({ success: true, data: academies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get academies joined by a user
export const getJoinedAcademies = async (req, res) => {
  try {
    const academies = await Academy.getJoinedAcademies(req.params.userId);
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

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Academy ID is required" 
      });
    }

    const academy = await Academy.toggleJoinAcademy(id, userId);
    
    if (!academy) {
      return res.status(404).json({ 
        success: false, 
        message: "Academy not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Academy membership updated successfully",
      data: academy,
    });
  } catch (err) {
    console.error("Error in toggleJoinAcademy:", err.message);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to update academy membership" 
    });
  }
};

// 🟢 Update Academy
export const updateAcademy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, createdBy } = req.body;

    const academy = await Academy.getAcademyById(id);
    if (!academy) {
      return res.status(404).json({ 
        success: false, 
        message: "Academy not found" 
      });
    }

    // Check if user is the creator (Firestore IDs are strings)
    if (String(academy.createdBy) !== String(createdBy)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the creator can update this academy" 
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (req.files?.logo?.[0]?.path) updateData.logo = req.files.logo[0].path;
    if (req.files?.banner?.[0]?.path) updateData.banner = req.files.banner[0].path;

    const updatedAcademy = await Academy.updateAcademy(id, updateData);
    
    res.json({
      success: true,
      message: "Academy updated successfully",
      data: updatedAcademy,
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

    const academy = await Academy.getAcademyById(id);
    if (!academy) {
      return res.status(404).json({ 
        success: false, 
        message: "Academy not found" 
      });
    }

    // Check if user is the creator (Firestore IDs are strings)
    if (String(academy.createdBy) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the creator can delete this academy" 
      });
    }

    // Delete all posts in this academy
    const { deletePostsByAcademy } = await import("../models/PostFirestore.js");
    await deletePostsByAcademy(id);

    // Delete the academy
    await Academy.deleteAcademy(id);

    res.json({
      success: true,
      message: "Academy deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

