# 🔧 Vercel Frontend Environment Variables

## Quick Answer: **OPTIONAL** - You have 2 options!

---

## Option 1: Use Vercel Rewrites (Recommended) ✅

**No environment variables needed!**

Your `vercel.json` already has rewrites configured:
```json
{
  "source": "/api/(.*)",
  "destination": "https://YOUR-BACKEND-NAME.onrender.com/api/$1"
}
```

This means API calls go through Vercel's proxy automatically.

### How it works:
- Frontend calls: `/api/academies`
- Vercel rewrites to: `https://your-backend.onrender.com/api/academies`
- No CORS issues!

### To use this:
1. **Update `vercel.json`** - Replace `YOUR-BACKEND-NAME` with your actual Render backend name
2. **Don't add any environment variables** in Vercel
3. Deploy!

---

## Option 2: Direct API Calls

If you want to call the backend directly (bypass rewrites):

### Add this in Vercel:
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   Key: VITE_API_URL
   Value: https://your-backend-name.onrender.com
   ```
3. Set it for **Production** environment
4. Save

### Then update `vercel.json`:
Remove or comment out the API rewrite (keep the SPA rewrite):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## ✅ Recommended: Option 1 (Rewrites)

**Why?**
- ✅ No environment variables needed
- ✅ Works automatically
- ✅ Handles CORS automatically
- ✅ Easier to manage

### Steps:
1. **Before deploying**, edit `frontend/vercel.json`:
   - Replace `YOUR-BACKEND-NAME` with your actual Render backend service name
   - Example: `academy-project-backend.onrender.com`

2. **In Vercel Dashboard:**
   - Don't add any environment variables
   - Just deploy!

3. **That's it!** Your frontend will work automatically.

---

## 🔍 Which one is active?

Your `api.js` checks in this order:
1. `VITE_API_URL` (if set) → Use this
2. Empty string in production → Use rewrites ✅ (Recommended)
3. `localhost:5000` in development → Local dev

---

## 📝 Summary

**For Vercel frontend deployment:**

### If using rewrites (Recommended):
- ✅ Update `vercel.json` with your Render backend URL
- ❌ No environment variables needed
- ✅ Deploy and done!

### If using direct API:
- ✅ Add `VITE_API_URL` environment variable in Vercel
- ✅ Remove API rewrite from `vercel.json`
- ✅ Deploy

---

## 🎯 Recommended Setup:

**Step 1:** Update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://academy-project-backend.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Step 2:** Deploy to Vercel
- No environment variables needed!

**Step 3:** Done! 🎉





