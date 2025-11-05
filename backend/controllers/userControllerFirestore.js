import * as User from "../models/UserFirestore.js";

// ✅ Login or Register User
export const loginUser = async (req, res) => {
  try {
    console.log('[LOGIN] Request received:', { name: req.body.name, email: req.body.email });
    const { name, email } = req.body;

    if (!name || !email) {
      console.log('[LOGIN] Missing name or email');
      return res.status(400).json({ 
        success: false, 
        message: "Name and email required" 
      });
    }

    console.log('[LOGIN] Checking for existing user with email:', email);
    let user = await User.getUserByEmail(email);

    // If user doesn't exist, create one
    if (!user) {
      console.log('[LOGIN] User not found, creating new user');
      try {
        user = await User.createUser({ name, email });
        console.log('[LOGIN] User created successfully:', user._id);
      } catch (createError) {
        // If user was created between check and create (race condition), try fetching again
        if (createError.message.includes('already exists')) {
          console.log('[LOGIN] User was created between check and create, fetching again');
          user = await User.getUserByEmail(email);
          if (!user) {
            throw new Error('Failed to create or retrieve user');
          }
        } else {
          throw createError;
        }
      }
    } else {
      console.log('[LOGIN] User found:', user._id);
    }

    console.log('[LOGIN] Login successful, returning user data');
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error in login:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in",
    });
  }
};






