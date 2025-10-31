import Academy from "../models/CreatedAcademy.js";

export const createAcademy = async (req, res) => {
  try {
    console.log("📸 Uploaded files:", JSON.stringify(req.files, null, 2));

    const { name, category, description } = req.body;

    const logoUrl = req.files?.logo?.[0]?.path || "";
    const bannerUrl = req.files?.banner?.[0]?.path || "";

    const createdBy = "dummy_user_12345";

    const academy = new Academy({
      name,
      category,
      description,
      logo: logoUrl,
      banner: bannerUrl,
      createdBy,
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
// ✅ Fetch all academies
export const getAllAcademies = async (req, res) => {
  try {
    const academies = await Academy.find().sort({ createdAt: -1 });
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

// ✅ Fetch a single academy by ID
export const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id);

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
