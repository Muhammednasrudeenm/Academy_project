import Academy from "../models/CreatedAcademy.js";

// ✅ Create new academy
export const createAcademy = async (req, res) => {
  try {
    console.log("📸 Uploaded files:", JSON.stringify(req.files, null, 2));

    const { name, category, description, userId } = req.body; // 👈 get from frontend

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required. Please log in.",
      });
    }

    const logoUrl = req.files?.logo?.[0]?.path || "";
    const bannerUrl = req.files?.banner?.[0]?.path || "";

    const academy = new Academy({
      name,
      category,
      description,
      logo: logoUrl,
      banner: bannerUrl,
      createdBy: userId, // 👈 store user as creator
    });

    await academy.save();

    return res.status(201).json({
      success: true,
      message: "Academy created successfully 🎉",
      data: academy,
    });
  } catch (error) {
    console.error("❌ Error creating academy:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating academy",
    });
  }
};


// ✅ Fetch all academies (or filter by user)
export const getAllAcademies = async (req, res) => {
  try {
    const { createdBy } = req.query; // read from ?createdBy=<userId>

    // If createdBy is provided, filter academies by that user; else return all
    const query = createdBy ? { createdBy } : {};

    const academies = await Academy.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: academies.length,
      data: academies,
    });
  } catch (error) {
    console.error("❌ Error fetching academies:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching academies",
    });
  }
};

// ✅ Fetch single academy by ID
export const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email"); // optional: show joined members

    if (!academy) {
      return res.status(404).json({
        success: false,
        message: "Academy not found",
      });
    }

    res.status(200).json({
      success: true,
      data: academy,
    });
  } catch (error) {
    console.error("❌ Error fetching academy:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching academy",
    });
  }
};
