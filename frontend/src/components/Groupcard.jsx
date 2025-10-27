import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/group/${group.id}`)}
      className="flex items-center p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition"
    >
      <img
        src={group.logo || "https://via.placeholder.com/50"}
        alt={group.name}
        className="w-12 h-12 rounded-full"
      />
      <div className="ml-4">
        <h3 className="font-semibold">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.sport}</p>
      </div>
    </div>
  );
}
