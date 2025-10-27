import { useState, useEffect } from "react";
import GroupCard from "../components/GroupCard";
import GroupForm from "../components/GroupForm";

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/groups");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups.");
      }
    };
    fetchGroups();
  }, []);

  const handleCreate = async (formData) => {
    try {
      const res = await fetch("http://localhost:5000/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create group");
      const newGroup = await res.json();
      setGroups([...groups, newGroup]);
      setShowForm(false);
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group.");
    }
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sports Academies</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "Create Academy"}
        </button>
      </div>

      {showForm && <GroupForm onSubmit={handleCreate} />}

      <div className="grid gap-4 mt-6">
        {groups.map((group) => (
          <GroupCard key={group._id || group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
