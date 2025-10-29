import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function Form() {
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

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setLogoPreview(null);
  }, [logoFile]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setBannerPreview(null);
  }, [bannerFile]);

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
      setSuccess(true);
      setName("");
      setCategory("");
      setDescription("");
      setLogoFile(null);
      setBannerFile(null);
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.message || "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-green-100 dark:bg-gray-900 relative z-50 px-4 sm:px-10">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-green-600 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-sm sm:text-base">Back</span>
        </button>
      </div>

      {/* Main Form Container */}
      <main className="w-full flex-1 ml-0 md:ml-[16.5rem] mr-0 md:mr-[16.5rem] sm:p-4 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl p-6 sm:p-10 md:p-12 space-y-6 transition-all duration-300"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center">
            Create Academic Group
          </h2>

          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-800 text-sm dark:bg-green-800 dark:text-green-100 text-center">
              Academy created successfully.
            </div>
          )}

          {errors.submit && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm dark:bg-red-800 dark:text-red-100 text-center">
              {errors.submit}
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Academy Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`block w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.name
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                placeholder="e.g. Riverside Sports Academy"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`block w-full rounded-lg border bg-gray-100 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  errors.category
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.description
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              placeholder="Write about the academy, focus areas, or training schedule..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                {errors.description}
              </p>
            )}
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Logo (optional)
              </label>
              <label className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="max-h-36 object-contain"
                  />
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-300 px-4 text-center">
                    Click to upload logo
                  </div>
                )}
              </label>
              {errors.logo && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  {errors.logo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Banner (optional)
              </label>
              <label className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                />
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="banner preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-300 px-4 text-center">
                    Click to upload banner
                  </div>
                )}
              </label>
              {errors.banner && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  {errors.banner}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium shadow transition duration-200 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Academy"}
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
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition"
            >
              Reset
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
