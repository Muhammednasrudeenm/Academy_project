import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import { ToastProvider } from "./contexts/ToastContext";

// Lazy load components for code splitting
const Form = lazy(() => import("./pages/Form"));
const Available_Communities = lazy(() => import("./pages/Available_Communities"));
const CommunityPosts = lazy(() => import("./pages/CommunityPosts"));
const Login = lazy(() => import("./pages/Login"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Landing page - Shows academies */}
          <Route
            path="/"
            element={
              <DashboardLayout hideMobileHamburger={true}>
                <Available_Communities />
              </DashboardLayout>
            }
          />
          
          {/* Form page has no sidebar */}
          <Route path="/form" element={<Form />} />
          <Route path="/form/edit/:academyId" element={<Form />} />

          {/* Pages that use sidebar */}
          <Route
            path="/communities"
            element={
              <DashboardLayout hideMobileHamburger={true}>
                <Available_Communities />
              </DashboardLayout>
            }
          />
          <Route
            path="/community/:communityId"
            element={<CommunityPosts />}
          />
        </Routes>
      </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
