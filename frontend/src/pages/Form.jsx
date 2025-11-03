import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, CheckCircle, Sparkles, School } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { updateAcademy } from "../api/api";

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
    if (!name.trim()) e.name = "Academy name is required.";
    if (!category) e.category = "Please select a category.";
    if (!description.trim()) e.description = "Description is required.";
    if (logoFile && !/^image\/(png|jpe?g|webp|svg\+xml)$/.test(logoFile.type))
      e.logo = "Logo must be an image.";
    if (bannerFile && !/^image\/(png|jpe?g|webp)$/.test(bannerFile.type))
      e.banner = "Banner must be JPG, PNG, or WebP.";
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
      const res = await fetch("http://localhost:5000/api/academies/create", {
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative z-50 px-4 sm:px-10 overflow-x-hidden">
      {/* Animated Background Elements - Hidden on Mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles Animation - Hidden on Mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-sky-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Back Arrow - Always Visible */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[100]">
        <button
          onClick={() => window.history.back()}
          className="group cursor-pointer text-gray-300 hover:text-white transition-all duration-300"
          aria-label="Go back"
        >
          <ArrowLeft size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Form Container */}
      <main className="w-full max-w-4xl flex-1 ml-0 md:ml-[16.5rem] mr-0 md:mr-[16.5rem] py-2 sm:py-4 md:py-8 px-4 md:p-8 relative z-10">
        <div className="animate-slideUp">
          <form
            onSubmit={handleSubmit}
            className="relative w-full bg-gradient-to-br from-[#1E293B]/95 via-[#15202B]/95 to-[#1E293B]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 border border-gray-700/50 overflow-hidden"
          >
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-sky-500/10 blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Header Section */}
              <div className="text-center mb-8 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/30 to-purple-500/30 mb-4 shadow-lg">
                  <School size={32} className="text-sky-300" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  {isEditMode ? "Edit Academy" : "Create Your Academy"}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  {isEditMode ? "Update your academy details" : "Build a community and share your passion"}
                </p>
              </div>

              {/* Success Message - Animated */}
              {success && (
                <div className="animate-slideDown p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-300 text-center backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} className="animate-bounce" />
                    <span className="font-semibold">
                      {isEditMode ? "Academy updated successfully! Redirecting..." : "Academy created successfully! Redirecting..."}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message - Animated */}
              {errors.submit && (
                <div className="animate-shake p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-300 text-center backdrop-blur-sm shadow-lg">
                  {errors.submit}
                </div>
              )}

              {/* Input Fields Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn delay-100">
                {/* Academy Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <Sparkles size={16} className="text-sky-400" />
                    Academy Name
                  </label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-xl border-2 px-4 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 ${
                        errors.name
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50 animate-shake"
                          : "border-gray-700/50 hover:border-gray-600"
                      }`}
                      placeholder="e.g. Riverside Sports Academy"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400 animate-fadeIn flex items-center gap-1">
                      <X size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <School size={16} className="text-purple-400" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full rounded-xl border-2 bg-gray-800/50 backdrop-blur-sm px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 ${
                        errors.category
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50 animate-shake"
                          : "border-gray-700/50 hover:border-gray-600 focus:border-purple-500"
                      }`}
                    >
                      <option value="" className="bg-gray-800">Choose a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-gray-800">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-400 animate-fadeIn flex items-center gap-1">
                      <X size={12} />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 animate-fadeIn delay-200">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                  <Sparkles size={16} className="text-indigo-400" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 ${
                    errors.description
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50 animate-shake"
                      : "border-gray-700/50 hover:border-gray-600"
                  }`}
                  placeholder="Write about the academy, its mission, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400 animate-fadeIn flex items-center gap-1">
                    <X size={12} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Uploads Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn delay-300">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <Upload size={16} className="text-blue-400" />
                    Logo (optional)
                  </label>
                  <label className="group relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:border-sky-500/50">
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
                      <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-sky-400 transition-colors">
                        <div className="p-3 rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 transition-all">
                          <Upload size={24} className="text-sky-400" />
                        </div>
                        <span className="text-sm font-medium">Click to upload logo</span>
                        <span className="text-xs text-gray-500">PNG, JPG, or WebP</span>
                      </div>
                    )}
                  </label>
                  {errors.logo && (
                    <p className="mt-1 text-xs text-red-400 animate-fadeIn flex items-center gap-1">
                      <X size={12} />
                      {errors.logo}
                    </p>
                  )}
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <Upload size={16} className="text-purple-400" />
                    Banner (optional)
                  </label>
                  <label className="group relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:border-purple-500/50">
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
                      <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-purple-400 transition-colors">
                        <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-all">
                          <Upload size={24} className="text-purple-400" />
                        </div>
                        <span className="text-sm font-medium">Click to upload banner</span>
                        <span className="text-xs text-gray-500">PNG, JPG, or WebP</span>
                      </div>
                    )}
                  </label>
                  {errors.banner && (
                    <p className="mt-1 text-xs text-red-400 animate-fadeIn flex items-center gap-1">
                      <X size={12} />
                      {errors.banner}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 animate-fadeIn delay-400">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-purple-600 hover:from-sky-600 hover:via-sky-700 hover:to-purple-700 text-white font-bold text-base shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      <span>{isEditMode ? "Update Academy" : "Create Academy"}</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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
                  className="px-6 py-4 rounded-2xl bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300 border border-gray-700/50 hover:border-gray-600 backdrop-blur-sm transform hover:scale-105"
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
      `}</style>
    </div>
  );
}
