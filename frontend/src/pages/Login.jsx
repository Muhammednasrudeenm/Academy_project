import React, { useState } from "react";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email) {
      setError("Please enter both name and email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save user in localStorage
      localStorage.setItem("user", JSON.stringify(data.data));
      setSuccess(true);

      // ✅ Redirect to home after success
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
          Login / Register
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            Logged in successfully ✅
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
