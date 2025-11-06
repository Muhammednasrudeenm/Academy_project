import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ BUILD VERSION - This will change on each deployment to bust cache
const BUILD_VERSION = 'v2.0.1-' + Date.now();
console.log('[LOGIN] ============================================');
console.log('[LOGIN] Login component loaded - Build:', BUILD_VERSION);
console.log('[LOGIN] Expected backend URL: https://academy-project-agmw.onrender.com');
console.log('[LOGIN] If you see localhost or vercel.app, you have OLD cached code!');
console.log('[LOGIN] ============================================');

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
    
    // ✅ IMMEDIATE CONSOLE LOG - This will show even if validation fails
    console.log('[LOGIN] ============================================');
    console.log('[LOGIN] Login attempt started - Build:', BUILD_VERSION);
    console.log('[LOGIN] Current time:', new Date().toISOString());
    console.log('[LOGIN] ============================================');
    
    try {
      // DEFINITIVE BACKEND URL - HARDCODED - NEVER CHANGE THIS
      // This is the Render backend URL that serves the API
      const BACKEND_URL = 'https://academy-project-agmw.onrender.com';
      
      // ✅ IMMEDIATE VALIDATION - Log the constant value
      console.log('[LOGIN] BACKEND_URL constant value:', BACKEND_URL);
      console.log('[LOGIN] BACKEND_URL type:', typeof BACKEND_URL);
      console.log('[LOGIN] BACKEND_URL length:', BACKEND_URL?.length);
      
      // CRITICAL: Check if we're using the wrong URL pattern (old cached code)
      // If BACKEND_URL is empty or wrong, throw an error immediately
      if (!BACKEND_URL || BACKEND_URL.includes('vercel.app') || BACKEND_URL.includes('localhost')) {
        const errorMsg = `CRITICAL: Wrong backend URL detected! Using: ${BACKEND_URL}. This indicates old cached code is running. Please hard refresh (Ctrl+Shift+R) or clear browser cache.`;
        console.error('[LOGIN]', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // CONSTRUCT ABSOLUTE URL DIRECTLY - NO STRING CONCATENATION THAT COULD FAIL
      // This prevents any possibility of double slashes or relative URLs
      const apiUrl = BACKEND_URL + '/api/users/login';
      
      // EXTRA SAFETY: Check if the constructed URL contains wrong URLs (old code)
      if (apiUrl.includes('vercel.app') || apiUrl.includes('localhost')) {
        const errorMsg = `CRITICAL: Detected wrong URL in API call! URL: ${apiUrl}. Expected: https://academy-project-94om.onrender.com/api/users/login. This means old cached JavaScript is running. Please hard refresh (Ctrl+Shift+R) or clear browser cache.`;
        console.error('[LOGIN]', errorMsg);
        console.error('[LOGIN] BACKEND_URL constant:', BACKEND_URL);
        console.error('[LOGIN] Constructed apiUrl:', apiUrl);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // CRITICAL VALIDATION - Ensure URL is using Render backend with HTTPS
      if (!apiUrl.startsWith('https://academy-project-agmw.onrender.com')) {
        console.error('[LOGIN] CRITICAL: Constructed URL is not using Render backend!', apiUrl);
        console.error('[LOGIN] BACKEND_URL constant:', BACKEND_URL);
        console.error('[LOGIN] Expected URL to start with: https://academy-project-agmw.onrender.com');
        const errorMsg = `API URL configuration error! Got: ${apiUrl}. Expected: https://academy-project-agmw.onrender.com/api/users/login. This indicates old cached code. Clear browser cache!`;
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // Additional validation - ensure no double slashes
      if (apiUrl.includes('//api') || apiUrl.includes('//api/')) {
        console.error('[LOGIN] CRITICAL: Double slash detected in URL!', apiUrl);
        throw new Error(`API URL configuration error. Double slash detected in: ${apiUrl}`);
      }
      
      // Set finalBase for logging (remove trailing slash if present)
      const finalBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
      
      // CRITICAL: Log the exact URL being used
      console.log('[LOGIN] ===== LOGIN DEBUG INFO =====');
      console.log('[LOGIN] BACKEND_URL (hardcoded):', BACKEND_URL);
      console.log('[LOGIN] Final API URL (constructed):', apiUrl);
      console.log('[LOGIN] URL validation - starts with https://:', apiUrl.startsWith('https://'));
      console.log('[LOGIN] URL validation - contains double slash:', apiUrl.includes('//'));
      console.log('[LOGIN] Current origin:', window.location.origin);
      console.log('[LOGIN] Current hostname:', window.location.hostname);
      console.log('[LOGIN] VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
      console.log('[LOGIN] ===========================');
      
      // Set debug info for mobile (visible on screen)
      setDebugInfo({
        apiBase: finalBase,
        apiUrl: apiUrl,
        origin: window.location.origin,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        status: 'Connecting...',
        viteApiUrl: import.meta.env.VITE_API_URL || 'not set',
        isAbsolute: apiUrl.startsWith('https://'),
        backendUrl: BACKEND_URL,
        hasDoubleSlash: apiUrl.includes('//api') || apiUrl.includes('//api/')
      });
      
      // Test backend connectivity first (with retry for Render spin-down)
      // Note: Health check is optional - we'll continue even if it fails
      let healthCheckSuccess = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const healthUrl = `${finalBase}/api/health`;
          const healthController = new AbortController();
          const healthTimeout = setTimeout(() => healthController.abort(), 30000); // 30 seconds for Render spin-up
          const healthCheck = await fetch(healthUrl, {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache',
            signal: healthController.signal,
          });
          clearTimeout(healthTimeout);
          if (healthCheck.ok) {
            setDebugInfo(prev => ({ ...prev, healthCheck: healthCheck.status, status: 'Health check OK' }));
            healthCheckSuccess = true;
            console.log('[LOGIN] Backend health check successful:', healthCheck.status);
            break;
          }
        } catch (healthError) {
          if (attempt === 0) {
            setDebugInfo(prev => ({ ...prev, healthCheck: 'Retrying...', status: 'Backend may be spinning up, retrying health check...' }));
            console.warn('[LOGIN] Health check failed, retrying (Render may be spinning up):', healthError.message);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
          } else {
            setDebugInfo(prev => ({ ...prev, healthCheck: 'Failed (continuing anyway)', healthError: healthError.message }));
            console.warn('[LOGIN] Health check failed after retry, but continuing with login attempt:', healthError.message);
          }
        }
      }
      
      // Log health check result
      if (healthCheckSuccess) {
        console.log('[LOGIN] Backend is reachable, proceeding with login...');
      } else {
        console.warn('[LOGIN] Backend health check failed, but attempting login anyway (backend may be spinning up)...');
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
          // Increased timeout for Render free tier spin-up (can take 60+ seconds on first request)
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          setDebugInfo(prev => ({ ...prev, status: attempt === 0 ? 'Sending login request...' : `Retrying login request (attempt ${attempt + 1})...` }));
          
          // CRITICAL: Final runtime validation before fetch
          // This is the absolute last check before making the request
          if (!apiUrl || typeof apiUrl !== 'string') {
            console.error('[LOGIN] CRITICAL: apiUrl is not a string!', typeof apiUrl, apiUrl);
            throw new Error('API URL is invalid before fetch');
          }
          
          if (apiUrl.trim() === '' || apiUrl === '//api/users/login') {
            console.error('[LOGIN] CRITICAL: apiUrl is empty or relative!', apiUrl);
            throw new Error(`API URL is empty or relative: ${apiUrl}`);
          }
          
          if (!apiUrl.startsWith('https://academy-project-94om.onrender.com')) {
            console.error('[LOGIN] CRITICAL: apiUrl is not using Render backend!', apiUrl);
            console.error('[LOGIN] Expected to start with: https://academy-project-94om.onrender.com');
            console.error('[LOGIN] Actual URL:', apiUrl);
            throw new Error(`API URL is not using correct backend. Got: ${apiUrl}`);
          }
          
          console.log('[LOGIN] Attempting fetch:', {
            url: apiUrl,
            method: 'POST',
            attempt: attempt + 1,
            maxRetries: maxRetries,
            urlLength: apiUrl.length,
            urlStartsWith: apiUrl.substring(0, 40)
          });
          
          // Log request details before sending
          const requestBody = JSON.stringify({ name, email });
          console.log('[LOGIN] Request body:', requestBody);
          console.log('[LOGIN] Request headers:', {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          });
          
          res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: requestBody,
            signal: controller.signal,
            mode: 'cors', // Explicitly set CORS mode
            credentials: 'omit', // Don't send credentials to avoid CORS issues
            cache: 'no-cache', // Prevent caching issues
            redirect: 'follow', // Follow redirects
          });
          
          console.log('[LOGIN] Response received:', {
            status: res.status,
            statusText: res.statusText,
            ok: res.ok,
            headers: Object.fromEntries(res.headers.entries())
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
            attempt: attempt + 1,
            maxRetries: maxRetries
          };
          
          setDebugInfo(prev => ({ 
            ...prev, 
            status: attempt === maxRetries - 1 ? 'ERROR' : `Retrying... (${fetchError.message})`, 
            error: `${fetchError.name}: ${fetchError.message}`,
            errorDetails: JSON.stringify(errorDetails, null, 2),
            networkError: true
          }));
          
          console.error('[LOGIN] Fetch error details:', errorDetails);
          console.error('[LOGIN] Error type:', fetchError.name);
          console.error('[LOGIN] Error message:', fetchError.message);
          console.error('[LOGIN] Error stack:', fetchError.stack);
          
          lastError = fetchError;
          
          if (attempt === maxRetries - 1) {
            // Last attempt failed, throw error with helpful message
            if (fetchError.name === 'AbortError') {
              throw new Error('Request timeout after 60 seconds. The Render backend may be spinning up (first request can take up to 60 seconds). Please try again in a few moments.');
            }
            if (fetchError.name === 'TypeError' && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError') || fetchError.message.includes('Load failed'))) {
              throw new Error(`Network error: Cannot connect to backend server.\n\nPossible causes:\n1. Render backend is spinning up (wait 60 seconds and retry)\n2. Backend server is down\n3. Network connectivity issue\n\nBackend URL: ${finalBase}\n\nPlease wait a moment and try again.`);
            }
            // Generic error
            throw new Error(`Connection failed: ${fetchError.message || 'Unknown network error'}. Please check your internet connection and try again.`);
          }
        }
      }
      
      if (!res) {
        throw lastError || new Error('Request failed after retries');
      }

      const data = await res.json();
      
      console.log('[LOGIN] Response data:', data);

      if (!data.success) {
        console.error('[LOGIN] Login failed:', data.message);
        throw new Error(data.message || "Login failed");
      }

      if (!data.data) {
        console.error('[LOGIN] No user data in response:', data);
        throw new Error("No user data received from server");
      }

      console.log('[LOGIN] Saving user to localStorage:', data.data);
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
                {debugInfo.hasDoubleSlash && (
                  <div className="mt-2 p-2 bg-[#f4212e]/20 rounded border border-[#f4212e]/50">
                    <div className="text-[#f4212e] font-bold text-[11px]">⚠️ ERROR: Double slash detected in URL!</div>
                    <div className="text-[#f4212e] text-[10px] mt-1 break-all">{debugInfo.apiUrl}</div>
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
