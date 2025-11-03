import { db } from "../config/firebase.js";
import admin from "../config/firebase.js";

// Helper to convert Firestore doc to object
const docToObject = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    _id: doc.id,
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
  };
};

// 🟢 Create a new user
export const createUser = async (data) => {
  const userData = {
    name: data.name,
    email: data.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Check if user with email already exists
  const existingUser = await getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const docRef = await db.collection("users").add(userData);
  const doc = await docRef.get();
  return docToObject(doc);
};

// 🟢 Get user by ID
export const getUserById = async (id) => {
  const doc = await db.collection("users").doc(id).get();
  return docToObject(doc);
};

// 🟢 Get user by email
export const getUserByEmail = async (email) => {
  const snapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToObject(snapshot.docs[0]);
};

// 🟢 Get all users
export const getAllUsers = async () => {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => docToObject(doc));
};

// 🟢 Update user
export const updateUser = async (id, data) => {
  const updateData = {
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("users").doc(id).update(updateData);
  const doc = await db.collection("users").doc(id).get();
  return docToObject(doc);
};

// 🟢 Delete user
export const deleteUser = async (id) => {
  await db.collection("users").doc(id).delete();
  return { success: true };
};


