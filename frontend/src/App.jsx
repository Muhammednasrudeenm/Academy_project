import { BrowserRouter, Routes, Route } from "react-router-dom";
import Form from "./pages/Form";
import AcademySidebar from "./components/sidebar/AcademySidebar";
import Available_Communities from "./pages/Available_Communities";
import CommunityPosts from "./pages/CommunityPosts";
import Login from "./pages/Login";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AcademySidebar/>} />
        <Route path="/form" element={<Form />} />
        <Route path="/communities" element={<Available_Communities />} />
        <Route path="/community/:communityId" element={<CommunityPosts />} />

      </Routes>
    </BrowserRouter>
  );
}
