// Smart API URL resolver: uses VITE_API_URL environment variable first,
// then falls back based on environment
const getApiUrl = () => {
  // Priority 1: Use VITE_API_URL from environment variables (from .env file)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Check runtime hostname - if on localhost, use local backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development - use local backend server
    return 'http://localhost:5000';
  }
  
  // Priority 3: Production - use direct backend URL for mobile compatibility
  // Mobile browsers may have issues with Vercel rewrites, so use direct URL
  const BACKEND_URL = 'https://academy-project-94om.onrender.com';
  
  // Check if we're on mobile device
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // For mobile or if VITE_API_URL is not set, use direct backend URL
  if (isMobile || !import.meta.env.VITE_API_URL) {
    return BACKEND_URL;
  }
  
  // Priority 4: Fallback to empty string for relative URLs (Vercel rewrites)
  // This works for desktop but mobile may need direct URL
  return '';
};

// 🟢 Fetch all academies (with caching)
let academiesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 second cache

export const fetchAcademies = async (forceRefresh = false) => {
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && academiesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return academiesCache;
  }
  
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies`);
  if (!res.ok) throw new Error("Failed to fetch academies");
  const data = await res.json();
  
  // Cache the result
  academiesCache = data;
  cacheTimestamp = Date.now();
  
  return data;
};

// 🟢 Fetch a single academy by ID
export const fetchAcademyById = async (id) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch academy details");
  const data = await res.json();
  return data.data || data;
};

// 🟢 Fetch posts for an academy
export const fetchPostsByAcademy = async (id) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/${id}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

// 🟢 Create a new post in an academy
export const createPost = async (academyId, postData) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/${academyId}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

// 🟢 Upload media (image/video) using Cloudinary or backend upload route
export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("image", file); // Changed from "file" to "image" to match backend

  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/upload/single`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload media");
  }
  
  const data = await res.json();
  // Cloudinary returns path or secure_url
  const imageUrl = data.imageUrl || data.secure_url || data.url;
  
  if (!imageUrl) {
    throw new Error("Upload successful but no URL returned");
  }
  
  return { secure_url: imageUrl };
};

// 🟢 Join/Leave Academy
export const toggleJoinAcademy = async (academyId, userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/${academyId}/toggle-join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to toggle join");
  }
  return res.json();
};

// 🟢 Update Academy
export const updateAcademy = async (academyId, formData) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/${academyId}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update academy");
  return res.json();
};

// 🟢 Delete Academy
export const deleteAcademy = async (academyId, userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/${academyId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to delete academy");
  return res.json();
};

// 🟢 Like/Unlike Post
export const toggleLikePost = async (postId, userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/like/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json();
};

// 🟢 Get my academies
export const fetchMyAcademies = async (userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/user/${userId}/created`);
  if (!res.ok) throw new Error("Failed to fetch my academies");
  return res.json();
};

// 🟢 Get joined academies
export const fetchJoinedAcademies = async (userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/academies/user/${userId}/joined`);
  if (!res.ok) throw new Error("Failed to fetch joined academies");
  return res.json();
};

// 🟢 Get comments for a post
export const fetchPostComments = async (postId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/comments/${postId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
};

// 🟢 Create a comment
export const createComment = async (postId, commentData) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
};

// 🟢 Delete a comment
export const deleteComment = async (commentId, userId) => {
  const apiBase = getApiUrl();
  const res = await fetch(`${apiBase}/api/posts/comments/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
};

// 🟢 Delete a post
export const deletePost = async (postId, userId) => {
  const apiBase = getApiUrl();
  const url = `${apiBase}/api/posts/remove/${postId}`;
  console.log("Delete post URL:", url, "userId:", userId);
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Delete post error:", res.status, errorText);
    throw new Error(errorText || "Failed to delete post");
  }
  return res.json();
};
