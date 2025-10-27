import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroupsList from "./pages/GroupList";
import GroupDetail from "./pages/GroupDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GroupsList />} />
        <Route path="/group/:id" element={<GroupDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
