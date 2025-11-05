import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, CheckCircle, Sparkles, School } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { updateAcademy } from "../api/api";

// Smart API URL resolver: uses VITE_API_URL environment variable first,
// then falls back based on environment
const getApiUrl = () => {
  // Priority 1: Use VITE_API_URL from environment variables (from .env file)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Check runtime hostname - if on localhost, use local backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development - use local backend server
    return 'http://localhost:5000';
  }
  
  // Priority 3: Production (Vercel) - use relative URLs, Vercel rewrites will proxy to Render
  return '';
};

export default function Form() {
  const navigate = useNavigate();
  const { academyId } = useParams();
  const location = useLocation();
  const isEditMode = !!academyId;
  const academyData = location.state?.academy;
  const categories = [
    "Football",
    "Cricket",
    "Basketball",
    "Tennis",
    "Swimming",
    "Other",
  ];

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load academy data if in edit mode
  useEffect(() => {
    if (isEditMode && academyData) {
      setName(academyData.name || "");
      setCategory(academyData.category || "");
      setDescription(academyData.description || "");
      if (academyData.logo) setLogoPreview(academyData.logo);
      if (academyData.banner) setBannerPreview(academyData.banner);
    }
  }, [isEditMode, academyData]);

  // Image previews
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (!logoFile && !isEditMode) {
      setLogoPreview(null);
    }
  }, [logoFile, isEditMode]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (!bannerFile && !isEditMode) {
      setBannerPreview(null);
    }
  }, [bannerFile, isEditMode]);

  const validate = () => {
    const e = {};
    
    // Academy Name Validation
    if (!name.trim()) {
      e.name = "Academy name is required.";
    } else if (name.trim().length < 3) {
      e.name = "Academy name must be at least 3 characters.";
    } else if (name.trim().length > 50) {
      e.name = "Academy name must be less than 50 characters.";
    }
    
    // Category Validation
    if (!category) {
      e.category = "Please select a category.";
    }
    
    // Description Validation
    if (!description.trim()) {
      e.description = "Description is required.";
    } else if (description.trim().length < 10) {
      e.description = "Description must be at least 10 characters.";
    } else if (description.trim().length > 500) {
      e.description = "Description must be less than 500 characters.";
    }
    
    // Logo and Banner are optional - no validation needed
    
    return e;
  };

  async function handleSubmit(e) {
  e.preventDefault();
  setSuccess(false);
  const v = validate();
  setErrors(v);
  if (Object.keys(v).length) return;

  setSubmitting(true);
  try {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || !loggedUser._id) {
      setErrors({ submit: "Please log in first." });
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("createdBy", loggedUser._id);
    if (logoFile) formData.append("logo", logoFile);
    if (bannerFile) formData.append("banner", bannerFile);

    let data;
    if (isEditMode) {
      // Update existing academy
      data = await updateAcademy(academyId, formData);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/community/${academyId}`), 2000);
      } else {
        setErrors({
          submit: data.message || "Failed to update academy. Try again.",
        });
      }
    } else {
      // Create new academy
      const apiBase = getApiUrl();
      const res = await fetch(`${apiBase}/api/academies/create`, {
        method: "POST",
        body: formData,
      });
      data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setName("");
        setCategory("");
        setDescription("");
        setLogoFile(null);
        setBannerFile(null);
        setErrors({});
        setTimeout(() => navigate("/communities"), 2000);
      } else {
        setErrors({
          submit: data.message || "Failed to create academy. Try again.",
        });
      }
    }
  } catch (err) {
    setErrors({ submit: err.message || "Submission failed." });
  } finally {
    setSubmitting(false);
  }
}


  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-black relative z-50 px-4 sm:px-10 overflow-x-hidden">

      {/* Back Arrow - Always Visible */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[100]">
        <button
          onClick={() => window.history.back()}
          className="group cursor-pointer text-white hover:text-[#71767a] transition-colors p-2 rounded-full hover:bg-[#181818]"
          aria-label="Go back"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Form Container */}
      <main className="w-full max-w-4xl flex-1 ml-0 md:ml-[16.5rem] mr-0 md:mr-[16.5rem] py-2 sm:py-4 md:py-8 px-4 md:p-8 relative z-10">
        <div className="animate-slideUp">
          <form
            onSubmit={handleSubmit}
            className="relative w-full bg-black rounded-2xl shadow-2xl p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 border border-[#2f3336] overflow-hidden"
          >
            <div className="relative z-10">
              {/* Header Section - Twitter Style */}
              <div className="text-center mb-8">
                <h2 className="text-[20px] font-bold text-white mb-2 leading-tight">
                  {isEditMode ? "Edit Academy" : "Create Your Academy"}
                </h2>
                <p className="text-[#71767a] text-[15px] leading-normal">
                  {isEditMode ? "Update your academy details" : "Build a community and share your passion"}
                </p>
              </div>

              {/* Success Message - Twitter Style */}
              {success && (
                <div className="p-4 rounded-2xl bg-[#16181c] border border-[#2f3336] text-white text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} className="text-[#1d9bf0]" />
                    <span className="text-[15px] font-semibold leading-normal">
                      {isEditMode ? "Academy updated successfully!" : "Academy created successfully!"}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message - Twitter Style */}
              {errors.submit && (
                <div className="p-4 rounded-2xl bg-[#16181c] border border-[#f4212e] text-[#f4212e] text-center">
                  <span className="text-[15px] leading-normal">{errors.submit}</span>
                </div>
              )}

              {/* Input Fields Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn delay-100">
                {/* Academy Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[15px] font-bold text-white leading-normal">
                    Academy Name
                  </label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        // Clear error when user starts typing
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      maxLength={50}
                      className={`w-full rounded-xl border-2 px-4 py-3 bg-black text-white text-[15px] placeholder-[#71767a] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] leading-normal ${
                        errors.name
                          ? "border-[#f4212e] focus:border-[#f4212e] focus:ring-[#f4212e]"
                          : "border-[#2f3336] hover:border-[#71767a]"
                      }`}
                      placeholder="e.g. Riverside Sports Academy"
                    />
                    <div className="mt-1 text-right">
                      <span className={`text-[13px] leading-normal ${
                        name.length >= 45 
                          ? 'text-yellow-400' 
                          : name.length < 3 && name.length > 0
                          ? 'text-yellow-400'
                          : 'text-[#71767a]'
                      }`}>
                        {name.length}/50
                      </span>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-[13px] text-[#f4212e] flex items-center gap-1 leading-normal">
                      <X size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[15px] font-bold text-white leading-normal">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full rounded-xl border-2 bg-black px-4 py-3 text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] transition-all duration-300 min-h-[48px] leading-normal ${
                        errors.category
                          ? "border-[#f4212e] focus:border-[#f4212e] focus:ring-[#f4212e]"
                          : "border-[#2f3336] hover:border-[#71767a] focus:border-[#1d9bf0]"
                      }`}
                    >
                      <option value="" style={{ backgroundColor: '#000000', color: '#71767a' }}>Choose a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-black text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-[13px] text-[#f4212e] flex items-center gap-1 leading-normal">
                      <X size={12} />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[15px] font-bold text-white leading-normal">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    // Clear error when user starts typing
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  maxLength={500}
                  rows={5}
                  className={`w-full rounded-xl border-2 px-4 py-3 bg-black text-white text-[15px] placeholder-[#71767a] resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] leading-normal ${
                    errors.description
                      ? "border-[#f4212e] focus:border-[#f4212e] focus:ring-[#f4212e]"
                      : "border-[#2f3336] hover:border-[#71767a]"
                  }`}
                  placeholder="Write about the academy, its mission, and what makes it special..."
                />
                <div className="mt-1 text-right">
                  <span className={`text-[13px] leading-normal ${
                    description.length >= 450 
                      ? 'text-yellow-400' 
                      : description.length < 10 && description.length > 0
                      ? 'text-yellow-400'
                      : 'text-[#71767a]'
                  }`}>
                    {description.length}/500
                  </span>
                </div>
                {errors.description && (
                  <p className="mt-1 text-[13px] text-[#f4212e] flex items-center gap-1 leading-normal">
                    <X size={12} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Uploads Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn delay-300">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[15px] font-bold text-white leading-normal">
                    Logo (optional)
                  </label>
                  <label className="group relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer bg-black hover:bg-[#181818] transition-all duration-300 overflow-hidden hover:border-[#1d9bf0] border-[#2f3336]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    />
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="logo preview"
                          className="w-full h-full object-contain p-4 animate-scaleIn"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoFile(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#71767a] group-hover:text-[#1d9bf0] transition-colors">
                        <div className="p-3 rounded-xl bg-[#16181c] group-hover:bg-[#1d9bf0]/10 transition-all">
                          <Upload size={24} className="text-[#1d9bf0]" />
                        </div>
                        <span className="text-[15px] font-medium leading-normal">Click to upload logo</span>
                        <span className="text-[13px] text-[#71767a] leading-normal">PNG, JPG, or WebP</span>
                      </div>
                    )}
                  </label>
                  {errors.logo && (
                    <p className="mt-1 text-[13px] text-[#f4212e] flex items-center gap-1 leading-normal">
                      <X size={12} />
                      {errors.logo}
                    </p>
                  )}
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[15px] font-bold text-white leading-normal">
                    Banner (optional)
                  </label>
                  <label className="group relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer bg-black hover:bg-[#181818] transition-all duration-300 overflow-hidden hover:border-[#1d9bf0] border-[#2f3336]">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                    />
                    {bannerPreview ? (
                      <>
                        <img
                          src={bannerPreview}
                          alt="banner preview"
                          className="w-full h-full object-cover animate-scaleIn"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerFile(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#71767a] group-hover:text-[#1d9bf0] transition-colors">
                        <div className="p-3 rounded-xl bg-[#16181c] group-hover:bg-[#1d9bf0]/10 transition-all">
                          <Upload size={24} className="text-[#1d9bf0]" />
                        </div>
                        <span className="text-[15px] font-medium leading-normal">Click to upload banner</span>
                        <span className="text-[13px] text-[#71767a] leading-normal">PNG, JPG, or WebP</span>
                      </div>
                    )}
                  </label>
                  {errors.banner && (
                    <p className="mt-1 text-[13px] text-[#f4212e] flex items-center gap-1 leading-normal">
                      <X size={12} />
                      {errors.banner}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons - Twitter Style */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[15px] leading-normal transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{isEditMode ? "Update Academy" : "Create Academy"}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setCategory("");
                    setDescription("");
                    setLogoFile(null);
                    setBannerFile(null);
                    setErrors({});
                    setSuccess(false);
                  }}
                  className="px-4 py-2 rounded-full bg-[#16181c] hover:bg-[#181818] text-white hover:text-[#71767a] font-semibold text-[15px] leading-normal transition-all duration-300 border border-[#2f3336]"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        /* Dropdown/Select Option Styling - Twitter Style */
        select option {
          background: #000000 !important;
          color: #ffffff !important;
          padding: 14px 18px !important;
          font-weight: 400;
          font-size: 15px;
          border: none;
          cursor: pointer;
        }
        select option:hover,
        select option:focus {
          background: #181818 !important;
          color: #ffffff !important;
        }
        select option:checked,
        select option[selected] {
          background: #16181c !important;
          color: #ffffff !important;
          font-weight: 500;
        }
        select option:disabled {
          color: #71767a !important;
          background: #000000 !important;
          cursor: not-allowed;
        }
        /* Styling for the select element itself */
        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px !important;
        }
        
        /* Mobile-specific dropdown styling */
        @media (max-width: 640px) {
          /* Ensure touch-friendly select elements on mobile */
          select {
            min-height: 48px !important; /* iOS recommended touch target */
            font-size: 16px !important; /* Prevents zoom on iOS */
            padding: 14px 48px 14px 16px !important;
            background-position: right 14px center !important;
            background-size: 18px !important;
            border-radius: 12px !important;
          }
          
          /* Better mobile dropdown options - Twitter Style */
          select option {
            padding: 16px 20px !important;
            font-size: 16px !important;
            min-height: 48px !important;
            line-height: 1.5 !important;
            background: #000000 !important;
            color: #ffffff !important;
          }
          select option:hover,
          select option:focus {
            background: #181818 !important;
          }
          select option:checked,
          select option[selected] {
            background: #16181c !important;
          }
          
          /* Mobile select focus states - Twitter Style */
          select:focus {
            border-color: #1d9bf0 !important;
            box-shadow: 0 0 0 1px #1d9bf0 !important;
          }
          
          /* Ensure dropdown menu is readable on mobile */
          select:active,
          select:focus {
            background-color: #000000 !important;
          }
        }
        
        /* Tablet and medium screen optimizations */
        @media (min-width: 641px) and (max-width: 1024px) {
          select {
            min-height: 44px !important;
            padding: 12px 44px 12px 16px !important;
          }
          
          select option {
            padding: 14px 18px !important;
            font-size: 15px !important;
            background: #000000 !important;
            color: #ffffff !important;
          }
          select option:hover,
          select option:focus {
            background: #181818 !important;
          }
          select option:checked,
          select option[selected] {
            background: #16181c !important;
          }
        }
      `}</style>
    </div>
  );
}
