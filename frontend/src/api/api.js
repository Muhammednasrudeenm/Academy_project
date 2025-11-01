const BASE_URL = "http://localhost:5000";

// 🟢 Fetch all academies
export const fetchAcademies = async () => {
  const res = await fetch(`${BASE_URL}/api/academies`);
  if (!res.ok) throw new Error("Failed to fetch academies");
  return res.json();
};

// 🟢 Fetch a single academy by ID
export const fetchAcademyById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/academies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch academy details");
  return res.json();
};

// 🟢 Fetch posts for an academy
export const fetchPostsByAcademy = async (id) => {
  const res = await fetch(`${BASE_URL}/api/posts/${id}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

// 🟢 Create a new post in an academy
export const createPost = async (academyId, postData) => {
  const res = await fetch(`${BASE_URL}/api/posts/${academyId}/posts`, {
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
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload media");
  return res.json(); // expected { url: "https://cloudinary.com/..." }
};
