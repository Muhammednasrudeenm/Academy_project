import { useState } from "react";

export default function GroupForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", sport: "", description: "" });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="name" placeholder="Academy Name" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <input name="sport" placeholder="Sport" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">Create</button>
    </form>
  );
}
