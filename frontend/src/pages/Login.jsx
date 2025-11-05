import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null); // For mobile debugging

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
        // DEFINITIVE BACKEND URL - NEVER CHANGE THIS
        const BACKEND_URL = 'https://academy-project-94om.onrender.com';
        
        // Priority 1: Check runtime hostname - if on localhost, use local backend
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          // Local development - use local backend server
          return 'http://localhost:5000';
        }
        
        // Priority 2: Use VITE_API_URL ONLY if it's set, not empty, and is a valid URL
        const viteApiUrl = import.meta.env.VITE_API_URL;
        if (viteApiUrl && typeof viteApiUrl === 'string' && viteApiUrl.trim() !== '' && viteApiUrl.startsWith('http')) {
          const trimmed = viteApiUrl.trim();
          // Ensure it doesn't end with a slash
          return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
        }
        
        // Priority 3: ALWAYS use direct backend URL as fallback
        // NEVER use relative URLs or empty strings - always use direct backend URL
        // Vercel rewrites cause CORS issues, so we bypass them completely
        return BACKEND_URL;
      };
      
      const apiBase = getApiUrl();
      
      // CRITICAL: Validate apiBase is never empty or undefined
      if (!apiBase || typeof apiBase !== 'string' || apiBase.trim() === '') {
        console.error('[LOGIN] CRITICAL: apiBase is invalid!', apiBase);
        throw new Error('API configuration error. Please contact support.');
      }
      
      // Ensure no double slashes
      const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      const apiUrl = `${cleanBase}/api/users/login`;
      
      // Final validation
      if (!apiUrl.startsWith('http')) {
        console.error('[LOGIN] CRITICAL: apiUrl is not absolute!', apiUrl);
        throw new Error('API URL configuration error. Please contact support.');
      }
      
      // Set debug info for mobile (visible on screen)
      setDebugInfo({
        apiBase: cleanBase, // Use cleaned base
        apiUrl: apiUrl,
        origin: window.location.origin,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        status: 'Connecting...',
        viteApiUrl: import.meta.env.VITE_API_URL || 'not set',
        isAbsolute: apiUrl.startsWith('http')
      });
      
      // Debug logging for mobile (also visible on screen)
      console.log('[LOGIN] API Base URL:', apiBase);
      console.log('[LOGIN] Full API URL:', apiUrl);
      console.log('[LOGIN] Current origin:', window.location.origin);
      console.log('[LOGIN] VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
      console.log('[LOGIN] User Agent:', navigator.userAgent);
      
      // Test backend connectivity first (with retry for Render spin-down)
      let healthCheckSuccess = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const healthUrl = `${cleanBase}/api/health`; // Use cleaned base
          const healthController = new AbortController();
          const healthTimeout = setTimeout(() => healthController.abort(), 15000); // 15 seconds for Render spin-up
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
          if (healthCheck.ok) {
            setDebugInfo(prev => ({ ...prev, healthCheck: healthCheck.status, status: 'Health check OK' }));
            healthCheckSuccess = true;
            console.log('[LOGIN] Backend health check:', healthCheck.status);
            break;
          }
        } catch (healthError) {
          if (attempt === 0) {
            setDebugInfo(prev => ({ ...prev, healthCheck: 'Retrying...', status: 'Backend may be spinning up, retrying...' }));
            console.warn('[LOGIN] Health check failed, retrying (Render may be spinning up):', healthError.message);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          } else {
            setDebugInfo(prev => ({ ...prev, healthCheck: 'Failed', healthError: healthError.message }));
            console.warn('[LOGIN] Health check failed after retry:', healthError.message);
          }
        }
      }
      
      // Better error handling for mobile fetch issues with retry for Render spin-down
      let res;
      const maxRetries = 2;
      let lastError = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setDebugInfo(prev => ({ ...prev, status: `Retrying login (attempt ${attempt + 1}/${maxRetries})...` }));
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
          }
          
          // Create abort controller for timeout (better browser compatibility)
          const controller = new AbortController();
          // Increased timeout for Render free tier spin-up (can take 30+ seconds)
          const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
          
          setDebugInfo(prev => ({ ...prev, status: attempt === 0 ? 'Sending login request...' : `Retrying login request (attempt ${attempt + 1})...` }));
          
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
          
          setDebugInfo(prev => ({ ...prev, responseStatus: res.status, responseOk: res.ok }));
          console.log('[LOGIN] Response status:', res.status);
          console.log('[LOGIN] Response ok:', res.ok);
          
          if (!res.ok) {
            const errorText = await res.text();
            setDebugInfo(prev => ({ ...prev, status: `Error: ${res.status}`, error: errorText }));
            console.error('[LOGIN] Response error:', errorText);
            throw new Error(`Server error (${res.status}): ${errorText || 'Unknown error'}`);
          }
          
          setDebugInfo(prev => ({ ...prev, status: 'Success! Processing response...' }));
          break; // Success, exit retry loop
          
        } catch (fetchError) {
          const errorDetails = {
            name: fetchError.name,
            message: fetchError.message,
            apiUrl: apiUrl,
            origin: window.location.origin,
          };
          
          setDebugInfo(prev => ({ 
            ...prev, 
            status: attempt === maxRetries - 1 ? 'ERROR' : `Retrying... (${fetchError.message})`, 
            error: `${fetchError.name}: ${fetchError.message}`,
            errorDetails: JSON.stringify(errorDetails, null, 2)
          }));
          
          console.error('[LOGIN] Fetch error details:', errorDetails);
          
          lastError = fetchError;
          
          if (attempt === maxRetries - 1) {
            // Last attempt failed, throw error
            if (fetchError.name === 'AbortError') {
              throw new Error('Request timeout. Please check your internet connection and try again. Render backend may be spinning up (takes ~30 seconds).');
            }
            if (fetchError.message && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
              throw new Error(`Cannot connect to server. Please check:\n1. Your internet connection\n2. Backend server is running at ${apiBase}\n3. Render backend may be spinning up (wait 30 seconds and try again)`);
            }
            throw fetchError;
          }
        }
      }
      
      if (!res) {
        throw lastError || new Error('Request failed after retries');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save user in localStorage
      localStorage.setItem("user", JSON.stringify(data.data));
      setDebugInfo(prev => ({ ...prev, status: 'Login successful! Redirecting...' }));
      setSuccess(true);

      // ✅ Redirect immediately using React Router (no page reload, much faster!)
      setTimeout(() => {
        setDebugInfo(null); // Clear debug info before redirect
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

          {/* Debug Info Panel - Visible on screen for mobile debugging */}
          {debugInfo && (
            <div className="mb-4 p-3 rounded-lg bg-[#16181c] border border-[#2f3336] text-left">
              <div className="text-[13px] text-[#71767a] mb-2 font-bold">Debug Info:</div>
              <div className="space-y-1 text-[12px] text-white">
                <div><span className="text-[#71767a]">Status:</span> <span className="text-[#1d9bf0]">{debugInfo.status}</span></div>
                <div><span className="text-[#71767a]">Hostname:</span> <span className="text-[#1d9bf0]">{debugInfo.hostname}</span></div>
                <div><span className="text-[#71767a]">VITE_API_URL:</span> <span className={debugInfo.viteApiUrl === 'not set' ? 'text-[#f4212e]' : 'text-[#00ba7c]'}>{debugInfo.viteApiUrl || 'not set'}</span></div>
                <div><span className="text-[#71767a]">API Base:</span> <span className={`${debugInfo.apiBase && debugInfo.apiBase.startsWith('http') ? 'text-[#00ba7c]' : 'text-[#f4212e]'} break-all`}>{debugInfo.apiBase}</span></div>
                <div><span className="text-[#71767a]">API URL:</span> <span className={`${debugInfo.isAbsolute ? 'text-[#00ba7c]' : 'text-[#f4212e]'} break-all`}>{debugInfo.apiUrl}</span></div>
                {debugInfo.isAbsolute === false && (
                  <div className="mt-2 p-2 bg-[#f4212e]/20 rounded border border-[#f4212e]/50">
                    <div className="text-[#f4212e] font-bold text-[11px]">⚠️ ERROR: API URL is not absolute!</div>
                  </div>
                )}
                {debugInfo.healthCheck && (
                  <div><span className="text-[#71767a]">Health:</span> <span className={debugInfo.healthCheck === 'Failed' ? 'text-[#f4212e]' : 'text-[#00ba7c]'}>{debugInfo.healthCheck}</span></div>
                )}
                {debugInfo.responseStatus && (
                  <div><span className="text-[#71767a]">Response:</span> <span className={debugInfo.responseOk ? 'text-[#00ba7c]' : 'text-[#f4212e]'}>{debugInfo.responseStatus} {debugInfo.responseOk ? 'OK' : 'ERROR'}</span></div>
                )}
                {debugInfo.error && (
                  <div className="mt-2 p-2 bg-black/50 rounded border border-[#f4212e]/50">
                    <div className="text-[#f4212e] font-bold mb-1">Error:</div>
                    <div className="text-[#f4212e] break-words">{debugInfo.error}</div>
                  </div>
                )}
              </div>
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
