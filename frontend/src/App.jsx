import { BrowserRouter, Routes, Route } from "react-router-dom";
import Form from "./pages/Form";
import Available_Communities from "./pages/Available_Communities";
import CommunityPosts from "./pages/CommunityPosts";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Form page has no sidebar */}
        <Route path="/form" element={<Form />} />

        {/* Pages that use sidebar */}
        <Route
          path="/communities"
          element={
            <DashboardLayout>
              <Available_Communities />
            </DashboardLayout>
          }
        />
        <Route
          path="/community/:communityId"
          element={
            <DashboardLayout>
              <CommunityPosts />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
