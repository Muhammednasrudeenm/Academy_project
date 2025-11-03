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
    // Convert Firestore timestamps to ISO strings
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
  };
};

// 🟢 Create a new academy
export const createAcademy = async (data) => {
  const academyData = {
    name: data.name,
    category: data.category,
    description: data.description,
    logo: data.logo || "",
    banner: data.banner || "",
    createdBy: data.createdBy,
    members: data.members || [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("academies").add(academyData);
  const doc = await docRef.get();
  return docToObject(doc);
};

// 🟢 Get all academies
export const getAllAcademies = async () => {
  const snapshot = await db.collection("academies").get();
  return snapshot.docs.map((doc) => docToObject(doc));
};

// 🟢 Get academy by ID
export const getAcademyById = async (id) => {
  const doc = await db.collection("academies").doc(id).get();
  return docToObject(doc);
};

// 🟢 Get academies created by a user
export const getMyAcademies = async (userId) => {
  const snapshot = await db
    .collection("academies")
    .where("createdBy", "==", userId)
    .get();
  return snapshot.docs.map((doc) => docToObject(doc));
};

// 🟢 Get academies joined by a user
export const getJoinedAcademies = async (userId) => {
  const snapshot = await db.collection("academies").get();
  const academies = snapshot.docs
    .map((doc) => docToObject(doc))
    .filter((academy) => {
      if (!academy || !academy.members) return false;
      // Firestore IDs are strings, so compare as strings
      return academy.members.some((member) => String(member.userId) === String(userId));
    });
  return academies;
};

// 🟢 Update academy
export const updateAcademy = async (id, data) => {
  const updateData = {
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("academies").doc(id).update(updateData);
  const doc = await db.collection("academies").doc(id).get();
  return docToObject(doc);
};

// 🟢 Delete academy
export const deleteAcademy = async (id) => {
  await db.collection("academies").doc(id).delete();
  return { success: true };
};

// 🟢 Toggle join/leave academy
export const toggleJoinAcademy = async (academyId, userId) => {
  const academy = await getAcademyById(academyId);
  if (!academy) throw new Error("Academy not found");

  const members = academy.members || [];
  // Firestore IDs are strings, so compare as strings
  const isMember = members.some((m) => String(m.userId) === String(userId));

  let updatedMembers;
  if (isMember) {
    updatedMembers = members.filter((m) => String(m.userId) !== String(userId));
  } else {
    updatedMembers = [
      ...members,
      {
        userId,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];
  }

  return await updateAcademy(academyId, { members: updatedMembers });
};

