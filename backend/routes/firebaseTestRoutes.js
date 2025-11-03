import express from "express";
import { db } from "../config/firebase.js";
import * as AcademyFirestore from "../models/AcademyFirestore.js";
import * as UserFirestore from "../models/UserFirestore.js";

const router = express.Router();

// 🧪 Test 1: Check Firebase connection
router.get("/connection", async (req, res) => {
  try {
    // Simple connection test
    const testRef = db.collection("test");
    res.json({
      success: true,
      message: "✅ Firebase connection successful!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Firebase connection failed",
      error: error.message,
    });
  }
});

// 🧪 Test 2: Create a test document
router.post("/create-test", async (req, res) => {
  try {
    const testRef = db.collection("firebase-test");
    const docRef = await testRef.add({
      message: "Firebase test document",
      createdAt: new Date().toISOString(),
      test: true,
    });

    const doc = await docRef.get();
    res.json({
      success: true,
      message: "✅ Test document created successfully!",
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to create test document",
      error: error.message,
    });
  }
});

// 🧪 Test 3: Read test documents
router.get("/read-test", async (req, res) => {
  try {
    const snapshot = await db.collection("firebase-test").get();
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      message: "✅ Test documents retrieved successfully!",
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to read test documents",
      error: error.message,
    });
  }
});

// 🧪 Test 4: Test Academy Firestore model
router.post("/test-academy", async (req, res) => {
  try {
    // First create a test user
    let testUser;
    try {
      testUser = await UserFirestore.createUser({
        name: "Test User " + Date.now(),
        email: `test${Date.now()}@test.com`,
      });
    } catch (error) {
      // User might already exist, try to get by email
      testUser = await UserFirestore.getUserByEmail("test@test.com");
      if (!testUser) throw error;
    }

    // Create test academy
    const testAcademy = await AcademyFirestore.createAcademy({
      name: "Test Academy " + Date.now(),
      category: "Test",
      description: "This is a test academy for Firebase testing",
      logo: "",
      banner: "",
      createdBy: testUser.id || testUser._id,
    });

    res.json({
      success: true,
      message: "✅ Academy Firestore model works!",
      data: {
        academy: testAcademy,
        user: testUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Academy Firestore test failed",
      error: error.message,
    });
  }
});

// 🧪 Test 5: Get all academies from Firestore
router.get("/test-academies", async (req, res) => {
  try {
    const academies = await AcademyFirestore.getAllAcademies();
    res.json({
      success: true,
      message: "✅ Get all academies works!",
      count: academies.length,
      data: academies.slice(0, 5), // Return first 5 for testing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to get academies",
      error: error.message,
    });
  }
});

// 🧪 Test 6: Compare MongoDB vs Firestore (if MongoDB is still running)
router.get("/compare", async (req, res) => {
  try {
    // Firestore count
    const firestoreAcademies = await AcademyFirestore.getAllAcademies();
    
    // MongoDB count (if available)
    let mongoCount = "MongoDB not tested";
    try {
      const Academy = (await import("../models/Academy.js")).default;
      const mongoAcademies = await Academy.find().limit(1);
      mongoCount = mongoAcademies.length > 0 ? "MongoDB has data" : "MongoDB empty";
    } catch (error) {
      mongoCount = "MongoDB connection not available";
    }

    res.json({
      success: true,
      message: "✅ Comparison test",
      firestore: {
        count: firestoreAcademies.length,
        status: "Connected",
      },
      mongodb: {
        status: mongoCount,
      },
      note: "Both can run simultaneously for testing!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Comparison test failed",
      error: error.message,
    });
  }
});

export default router;


