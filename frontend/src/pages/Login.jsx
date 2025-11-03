import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, User, Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
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
      // Use BASE_URL from api.js for consistency
      const BASE_URL = import.meta.env.VITE_API_URL || 
        (import.meta.env.MODE === 'production' || import.meta.env.PROD ? '' : 'http://localhost:5000');
      
      const res = await fetch(`${BASE_URL}/api/users/login`, {
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

      // ✅ Redirect immediately using React Router (no page reload, much faster!)
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 300); // Reduced from 1000ms to 300ms
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      {/* Premium Login Card */}
      <div className="relative z-10 w-full max-w-md animate-slideUp">
        <div className="relative bg-gradient-to-br from-[#1E293B]/95 via-[#15202B]/95 to-[#1E293B]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-700/50 overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-sky-500/10 blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/30 to-purple-500/30 mb-5 shadow-2xl">
                <LogIn size={40} className="text-sky-300" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-sm">
                Login or create a new account to get started
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="animate-slideDown p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-300 text-center backdrop-blur-sm shadow-lg mb-6">
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Logged in successfully!</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="animate-shake p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-300 text-center backdrop-blur-sm shadow-lg mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2 animate-fadeIn delay-100">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                  <User size={16} className="text-sky-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-700/50 rounded-xl px-4 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-300 hover:border-gray-600"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2 animate-fadeIn delay-200">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                  <Mail size={16} className="text-purple-400" />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-700/50 rounded-xl px-4 py-3.5 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:border-gray-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-purple-600 hover:from-sky-600 hover:via-sky-700 hover:to-purple-700 text-white font-bold text-base shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden animate-fadeIn delay-300"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Login / Register</span>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </form>
          </div>
        </div>
      </div>

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
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
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
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
