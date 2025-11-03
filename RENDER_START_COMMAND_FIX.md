# 🔧 Fix: Render Running Wrong Command

## Problem:
Render is running `npm run dev` (which needs nodemon) instead of `npm start` (which uses node)

## Quick Fix:

### In Render Dashboard:

1. Go to your backend service: https://render.com/dashboard
2. Click on your service name
3. Go to **Settings** tab
4. Scroll down to **"Start Command"**
5. Change it from `npm run dev` to:
   ```
   npm start
   ```
6. Click **"Save Changes"**
7. Render will automatically restart

### After Fix:
- Should run: `npm start` → `node server.js` ✅
- Won't run: `npm run dev` → `nodemon server.js` ❌

---

## Verify:
After saving, check logs - should see:
```
> node server.js
✅ Using Firebase credentials from environment variables
🚀 Server running on port 5000
```

---

**That's it! Just change the Start Command to `npm start` in Render settings.**

