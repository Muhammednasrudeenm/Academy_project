// Production API URL resolver - ALWAYS uses production backend URL
// This ensures the app works for any Vercel deployment
const getApiUrl = () => {
  // DEFINITIVE BACKEND URL - NEVER CHANGE THIS - HARDCODED
  // This is the Render backend URL that serves the API
  const BACKEND_URL = 'https://academy-project-agmw.onrender.com';
  
  // CRITICAL: Validate backend URL is not empty
  if (!BACKEND_URL || typeof BACKEND_URL !== 'string' || BACKEND_URL.trim() === '') {
    console.error('[API] CRITICAL: BACKEND_URL is empty or invalid!', BACKEND_URL);
    throw new Error('Backend URL configuration error. BACKEND_URL must be set.');
  }
  
  // ALWAYS return production backend URL
  return BACKEND_URL;
};

// Helper function to get clean API base URL with validation
const getCleanApiUrl = () => {
  const apiBase = getApiUrl();
  
  // CRITICAL: Validate apiBase is never empty
  if (!apiBase || typeof apiBase !== 'string' || apiBase.trim() === '') {
    console.error('[API] CRITICAL: apiBase is empty after getApiUrl()!', apiBase);
    // Force fallback to hardcoded URL
    const FALLBACK_URL = 'https://academy-project-agmw.onrender.com';
    console.error('[API] Using fallback URL:', FALLBACK_URL);
    return FALLBACK_URL;
  }
  
  // Remove trailing slash if present
  const cleanBase = apiBase.trim().endsWith('/') ? apiBase.trim().slice(0, -1) : apiBase.trim();
  
  // FINAL VALIDATION: Ensure cleanBase is still valid
  if (!cleanBase || cleanBase === '') {
    console.error('[API] CRITICAL: cleanBase is empty after trimming!', cleanBase);
    const FALLBACK_URL = 'https://academy-project-94om.onrender.com';
    return FALLBACK_URL;
  }
  
  // VALIDATE: Must be absolute URL
  if (!cleanBase.startsWith('https://') && !cleanBase.startsWith('http://')) {
    console.error('[API] CRITICAL: cleanBase is not absolute!', cleanBase);
    const FALLBACK_URL = 'https://academy-project-94om.onrender.com';
    return FALLBACK_URL;
  }
  
  return cleanBase;
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
  
  const apiBase = getCleanApiUrl();
  
  // CRITICAL: Validate apiBase before constructing URL
  if (!apiBase || apiBase.trim() === '') {
    console.error('[fetchAcademies] CRITICAL: apiBase is empty!', apiBase);
    throw new Error('API base URL is empty. Cannot make request.');
  }
  
  // Construct URL directly with validation (prevents double slash)
  const apiUrl = apiBase + '/api/academies';
  
  // Validate constructed URL
  if (!apiUrl.startsWith('https://') && !apiUrl.startsWith('http://')) {
    console.error('[fetchAcademies] CRITICAL: apiUrl is not absolute!', apiUrl);
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  
  if (apiUrl.includes('//api')) {
    console.error('[fetchAcademies] CRITICAL: Double slash detected!', apiUrl);
    throw new Error(`Double slash detected in API URL: ${apiUrl}`);
  }
  
  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[fetchAcademies] Error:', res.status, errorText);
      throw new Error(`Failed to fetch academies: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    
    // Validate response format
    if (!data || typeof data !== 'object') {
      console.error('[fetchAcademies] Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }
    
    // Cache the result
    academiesCache = data;
    cacheTimestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('[fetchAcademies] Fetch error:', error);
    throw error;
  }
};

// 🟢 Fetch a single academy by ID
export const fetchAcademyById = async (id) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/' + id;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch academy details: ${res.status} ${errorText}`);
  }
  const data = await res.json();
  return data.data || data;
};

// 🟢 Fetch posts for an academy
export const fetchPostsByAcademy = async (id) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/' + id + '/posts';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch posts: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Create a new post in an academy
export const createPost = async (academyId, postData) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/' + academyId + '/posts';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create post: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Upload media (image/video) using Cloudinary or backend upload route
export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("image", file); // Changed from "file" to "image" to match backend

  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/upload/single';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "POST",
    mode: 'cors',
    credentials: 'omit',
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
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/' + academyId + '/toggle-join';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to toggle join: ${res.status}`);
  }
  return res.json();
};

// 🟢 Update Academy
export const updateAcademy = async (academyId, formData) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/' + academyId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update academy");
  return res.json();
};

// 🟢 Delete Academy
export const deleteAcademy = async (academyId, userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/' + academyId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to delete academy");
  return res.json();
};

// 🟢 Like/Unlike Post
export const toggleLikePost = async (postId, userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/like/' + postId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json();
};

// 🟢 Get my academies
export const fetchMyAcademies = async (userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/user/' + userId + '/created';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch my academies: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Get joined academies
export const fetchJoinedAcademies = async (userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/academies/user/' + userId + '/joined';
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch joined academies: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Get comments for a post
export const fetchPostComments = async (postId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/comments/' + postId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch comments: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Create a comment
export const createComment = async (postId, commentData) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/comments/' + postId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify(commentData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create comment: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Delete a comment
export const deleteComment = async (commentId, userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const apiUrl = apiBase + '/api/posts/comments/' + commentId;
  if (!apiUrl.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${apiUrl}`);
  }
  const res = await fetch(apiUrl, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete comment: ${res.status} ${errorText}`);
  }
  return res.json();
};

// 🟢 Delete a post
export const deletePost = async (postId, userId) => {
  const apiBase = getCleanApiUrl();
  if (!apiBase || apiBase.trim() === '') {
    throw new Error('API base URL is empty. Cannot make request.');
  }
  const url = apiBase + '/api/posts/remove/' + postId;
  if (!url.startsWith('https://')) {
    throw new Error(`API URL is not absolute: ${url}`);
  }
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
