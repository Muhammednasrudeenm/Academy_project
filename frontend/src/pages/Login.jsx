import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        
        // Priority 3: Production - ALWAYS use direct backend URL
        // Vercel rewrites can fail on mobile, so always use direct URL in production
        const BACKEND_URL = 'https://academy-project-94om.onrender.com';
        
        // Always use direct backend URL in production (not localhost)
        // This ensures mobile compatibility and avoids Vercel rewrite issues
        return BACKEND_URL;
      };
      
      const apiBase = getApiUrl();
      const apiUrl = `${apiBase}/api/users/login`;
      
      // Debug logging for mobile
      console.log('[LOGIN] API Base URL:', apiBase);
      console.log('[LOGIN] Full API URL:', apiUrl);
      console.log('[LOGIN] Current origin:', window.location.origin);
      console.log('[LOGIN] User Agent:', navigator.userAgent);
      
      // Test backend connectivity first (optional health check)
      try {
        const healthUrl = `${apiBase}/api/health`;
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 10000);
        const healthCheck = await fetch(healthUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
          mode: 'cors',
          credentials: 'omit',
          signal: healthController.signal,
        });
        clearTimeout(healthTimeout);
        console.log('[LOGIN] Backend health check:', healthCheck.status);
      } catch (healthError) {
        console.warn('[LOGIN] Health check failed (continuing anyway):', healthError.message);
      }
      
      // Better error handling for mobile fetch issues
      let res;
      try {
        // Create abort controller for timeout (better browser compatibility)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ name, email }),
          signal: controller.signal,
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send credentials to avoid CORS issues
        });
        
        clearTimeout(timeoutId);
        
        console.log('[LOGIN] Response status:', res.status);
        console.log('[LOGIN] Response ok:', res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[LOGIN] Response error:', errorText);
          throw new Error(`Server error (${res.status}): ${errorText || 'Unknown error'}`);
        }
      } catch (fetchError) {
        console.error('[LOGIN] Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          apiUrl: apiUrl,
          origin: window.location.origin,
          userAgent: navigator.userAgent,
        });
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Please check your internet connection and try again.');
        }
        if (fetchError.message && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
          throw new Error(`Cannot connect to server. Please check:\n1. Your internet connection\n2. Backend server is running at ${apiBase}\n3. Try again in a few moments`);
        }
        throw fetchError;
      }

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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Twitter-style Login Card */}
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to Academy
            </h1>
            <p className="text-[#71767a] text-base">
              Join the community today.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-[#16181c] border border-[#2f3336]">
              <div className="flex items-center gap-2 text-[#00ba7c]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Logged in successfully!</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#16181c] border border-[#f4212e]">
              <p className="text-[#f4212e]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Name Field */}
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-lg text-white placeholder-[#71767a] focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-lg text-white placeholder-[#71767a] focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black font-bold rounded-full hover:bg-[#e6e6e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Next"
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
