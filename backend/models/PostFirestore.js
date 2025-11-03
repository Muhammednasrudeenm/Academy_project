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

// 🟢 Create a new post
export const createPost = async (data) => {
  const postData = {
    academy: data.academy,
    user: data.user,
    title: data.title || "",
    caption: data.caption || "",
    image: data.image || "",
    video: data.video || "",
    likes: 0,
    likedBy: [],
    comments: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("posts").add(postData);
  const doc = await docRef.get();
  return docToObject(doc);
};

// 🟢 Get posts by academy
export const getPostsByAcademy = async (academyId) => {
  // Note: For orderBy on createdAt, Firestore requires an index
  // If index doesn't exist, get all and sort in memory
  try {
    const snapshot = await db
      .collection("posts")
      .where("academy", "==", academyId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map((doc) => docToObject(doc));
  } catch (error) {
    // Fallback: Get all posts and sort in memory
    if (error.code === 9) { // FAILED_PRECONDITION - index needed
      const snapshot = await db
        .collection("posts")
        .where("academy", "==", academyId)
        .get();
      
      const posts = snapshot.docs.map((doc) => docToObject(doc));
      // Sort by createdAt descending
      return posts.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }
    throw error;
  }
};

// 🟢 Get post by ID
export const getPostById = async (postId) => {
  const doc = await db.collection("posts").doc(postId).get();
  return docToObject(doc);
};

// 🟢 Update post
export const updatePost = async (postId, data) => {
  const updateData = {
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("posts").doc(postId).update(updateData);
  const doc = await db.collection("posts").doc(postId).get();
  return docToObject(doc);
};

// 🟢 Delete post
export const deletePost = async (postId) => {
  await db.collection("posts").doc(postId).delete();
  return { success: true };
};

// 🟢 Delete all posts by academy
export const deletePostsByAcademy = async (academyId) => {
  const snapshot = await db
    .collection("posts")
    .where("academy", "==", academyId)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return { success: true, deleted: snapshot.docs.length };
};

// 🟢 Toggle like on post
export const toggleLikePost = async (postId, userId) => {
  const post = await getPostById(postId);
  if (!post) throw new Error("Post not found");

  const likedBy = post.likedBy || [];
  // Firestore IDs are strings, so compare as strings
  const isLiked = likedBy.some((id) => String(id) === String(userId));

  let updatedLikedBy;
  let newLikesCount;

  if (isLiked) {
    updatedLikedBy = likedBy.filter((id) => String(id) !== String(userId));
    newLikesCount = post.likes > 0 ? post.likes - 1 : 0;
  } else {
    updatedLikedBy = [...likedBy, userId];
    newLikesCount = post.likes + 1;
  }

  return await updatePost(postId, {
    likes: newLikesCount,
    likedBy: updatedLikedBy,
  });
};

// 🟢 Increment comment count
export const incrementCommentCount = async (postId) => {
  const post = await getPostById(postId);
  if (!post) throw new Error("Post not found");

  return await updatePost(postId, {
    comments: (post.comments || 0) + 1,
  });
};

// 🟢 Decrement comment count
export const decrementCommentCount = async (postId) => {
  const post = await getPostById(postId);
  if (!post) throw new Error("Post not found");

  const newCount = Math.max((post.comments || 0) - 1, 0);
  return await updatePost(postId, {
    comments: newCount,
  });
};

