import * as User from "../models/UserFirestore.js";

// ✅ Login or Register User
export const loginUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and email required" 
      });
    }

    let user = await User.getUserByEmail(email);

    // If user doesn't exist, create one
    if (!user) {
      user = await User.createUser({ name, email });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in",
    });
  }
};






