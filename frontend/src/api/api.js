const BASE_URL = "http://localhost:5000";

export const fetchGroups = () =>
  fetch(`${BASE_URL}/api/groups`).then((res) => res.json());

export const createGroup = (data) =>
  fetch(`${BASE_URL}/api/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
