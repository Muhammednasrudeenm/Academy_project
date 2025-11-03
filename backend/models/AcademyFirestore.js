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

// 🟢 Get all academies (optimized - no sorting overhead)
export const getAllAcademies = async () => {
  const snapshot = await db.collection("academies").get();
  // Return academies - sorting can be done on frontend if needed
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
  try {
    // Clean up members array - ensure proper format for Firestore
    let updateData = { ...data };
    
    // If updating members, ensure they're in the correct format
    // IMPORTANT: Cannot use FieldValue.serverTimestamp() inside arrays with update()
    // Must use actual Date or Timestamp
    if (updateData.members && Array.isArray(updateData.members)) {
      updateData.members = updateData.members.map((member) => {
        // Ensure userId is always a string
        const userId = typeof member.userId === 'object' && member.userId !== null
          ? (member.userId._id || member.userId.id || String(member.userId))
          : String(member.userId);
        
        // Handle joinedAt - must be a Date or Timestamp, NOT FieldValue
        let joinedAt = member.joinedAt;
        
        // If it's a FieldValue (serverTimestamp placeholder), convert to Date
        if (joinedAt && typeof joinedAt === 'object' && !joinedAt.toDate && !(joinedAt instanceof Date)) {
          // It's likely a FieldValue placeholder, use current date
          joinedAt = new Date();
        } else if (!joinedAt) {
          // No timestamp, use current date
          joinedAt = new Date();
        } else if (joinedAt && typeof joinedAt.toDate === 'function') {
          // Already a Firestore timestamp, convert to Date
          joinedAt = joinedAt.toDate();
        } else if (!(joinedAt instanceof Date)) {
          // Try to convert to Date
          joinedAt = new Date(joinedAt);
        }
        
        // Convert Date to Firestore Timestamp for storage
        const timestamp = joinedAt instanceof Date 
          ? admin.firestore.Timestamp.fromDate(joinedAt)
          : admin.firestore.Timestamp.now();
        
        return {
          userId: userId,
          joinedAt: timestamp, // Use Timestamp, not FieldValue
        };
      });
    }
    
    // Use Timestamp for updatedAt in the update object
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection("academies").doc(id).update(updateData);
    
    const doc = await db.collection("academies").doc(id).get();
    if (!doc.exists) {
      throw new Error("Academy not found after update");
    }
    
    return docToObject(doc);
  } catch (error) {
    console.error("Error updating academy:", error.message);
    throw error;
  }
};

// 🟢 Delete academy
export const deleteAcademy = async (id) => {
  await db.collection("academies").doc(id).delete();
  return { success: true };
};

// 🟢 Toggle join/leave academy
export const toggleJoinAcademy = async (academyId, userId) => {
  const academy = await getAcademyById(academyId);
  if (!academy) {
    throw new Error("Academy not found");
  }

  const members = academy.members || [];
  
  // Helper to extract userId from member (handles both string and object formats)
  const getMemberUserId = (member) => {
    if (!member || !member.userId) return null;
    // If userId is an object with _id, extract it
    if (typeof member.userId === 'object' && member.userId !== null) {
      return member.userId._id || member.userId.id || member.userId;
    }
    // If userId is a string, return it
    return member.userId;
  };

  // Normalize userId for comparison
  const normalizedUserId = String(userId);
  
  // Check if user is already a member
  const isMember = members.some((m) => {
    const memberUserId = getMemberUserId(m);
    return memberUserId && String(memberUserId) === normalizedUserId;
  });

  let updatedMembers;
  if (isMember) {
    // Remove member - keep original format but ensure userId is stored as string
      updatedMembers = members
      .filter((m) => {
        const memberUserId = getMemberUserId(m);
        return memberUserId && String(memberUserId) !== normalizedUserId;
      })
      .map((m) => {
        const memberUserId = getMemberUserId(m);
        // Keep existing joinedAt or use current timestamp (must be Date/Timestamp, not FieldValue)
        let joinedAt = m.joinedAt;
        if (!joinedAt) {
          joinedAt = admin.firestore.Timestamp.now();
        } else if (joinedAt && typeof joinedAt.toDate === 'function') {
          // Already a Firestore timestamp, keep it
          joinedAt = joinedAt;
        } else if (joinedAt instanceof Date) {
          joinedAt = admin.firestore.Timestamp.fromDate(joinedAt);
        } else {
          joinedAt = admin.firestore.Timestamp.now();
        }
        
        return {
          userId: memberUserId, // Ensure userId is always a string in Firestore
          joinedAt: joinedAt, // Use Timestamp, not FieldValue
        };
      });
  } else {
    // Add member - userId should be stored as string in Firestore
    updatedMembers = [
      ...members.map((m) => {
        const memberUserId = getMemberUserId(m);
        // Keep existing joinedAt - convert to Timestamp if needed
        let joinedAt = m.joinedAt;
        if (!joinedAt) {
          joinedAt = admin.firestore.Timestamp.now();
        } else if (joinedAt && typeof joinedAt.toDate === 'function') {
          // Already a Firestore timestamp, keep it
          joinedAt = joinedAt;
        } else if (joinedAt instanceof Date) {
          joinedAt = admin.firestore.Timestamp.fromDate(joinedAt);
        } else {
          joinedAt = admin.firestore.Timestamp.now();
        }
        
        return {
          userId: memberUserId, // Ensure userId is always a string
          joinedAt: joinedAt, // Use Timestamp, not FieldValue
        };
      }),
      {
        userId: String(userId), // Store as string
        joinedAt: admin.firestore.Timestamp.now(), // Use Timestamp, not FieldValue (can't use serverTimestamp in arrays)
      },
    ];
  }

  const result = await updateAcademy(academyId, { members: updatedMembers });
  return result;
};

