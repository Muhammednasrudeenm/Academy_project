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

// 🟢 Create a new comment
export const createComment = async (data) => {
  const commentData = {
    post: data.post,
    user: data.user,
    text: data.text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("comments").add(commentData);
  const doc = await docRef.get();
  return docToObject(doc);
};

// 🟢 Get comments by post
export const getCommentsByPost = async (postId) => {
  // Note: For orderBy on createdAt, Firestore requires an index
  // If index doesn't exist, get all and sort in memory
  try {
    const snapshot = await db
      .collection("comments")
      .where("post", "==", postId)
      .orderBy("createdAt", "asc") // Comments usually oldest first
      .get();
    
    return snapshot.docs.map((doc) => docToObject(doc));
  } catch (error) {
    // Fallback: Get all comments and sort in memory
    if (error.code === 9) { // FAILED_PRECONDITION - index needed
      const snapshot = await db
        .collection("comments")
        .where("post", "==", postId)
        .get();
      
      const comments = snapshot.docs.map((doc) => docToObject(doc));
      // Sort by createdAt ascending (oldest first)
      return comments.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return aTime - bTime;
      });
    }
    throw error;
  }
};

// 🟢 Get comment by ID
export const getCommentById = async (commentId) => {
  const doc = await db.collection("comments").doc(commentId).get();
  return docToObject(doc);
};

// 🟢 Delete comment
export const deleteComment = async (commentId) => {
  await db.collection("comments").doc(commentId).delete();
  return { success: true };
};

// 🟢 Delete all comments by post
export const deleteCommentsByPost = async (postId) => {
  const snapshot = await db
    .collection("comments")
    .where("post", "==", postId)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return { success: true, deleted: snapshot.docs.length };
};

