# 🚀 Complete Redeployment Guide

## Backend Deployment on Render

### Step 1: Verify Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service: `academy-project-94om`
3. Click on it to open service details

### Step 2: Manual Redeploy
1. In the Render dashboard, click on your backend service
2. Go to the **"Manual Deploy"** section
3. Click **"Clear build cache & deploy"** (this ensures a fresh build)
4. Wait for deployment to complete (usually 2-5 minutes)

### Step 3: Verify Backend Health
After deployment completes:
1. Test the health endpoint: https://academy-project-94om.onrender.com/api/health
2. You should see: `{"status":"healthy",...}`
3. Test login endpoint: https://academy-project-94om.onrender.com/api/users/test
4. You should see: `{"message":"User routes are working! ✅",...}`

### Step 4: Check Render Environment Variables
Ensure these are set in Render:
- `NODE_ENV=production`
- Firebase credentials (if using Firebase)
- Any other required environment variables

**To check/update:**
1. In Render dashboard → Your service → Environment
2. Verify all required variables are present

---

## Frontend Deployment on Vercel

### Step 1: Verify Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `academy-project-v4vn`
3. Click on it to open project details

### Step 2: Manual Redeploy
1. In Vercel dashboard, go to your project
2. Click on the **"Deployments"** tab
3. Find the latest deployment
4. Click the **three dots (⋮)** menu
5. Select **"Redeploy"**
6. Check **"Use existing Build Cache"** = **OFF** (uncheck it)
7. Click **"Redeploy"**
8. Wait for deployment to complete (usually 1-3 minutes)

### Step 3: Verify Deployment
1. Wait for deployment status to show **"Ready"** (green checkmark)
2. Click on the deployment to get the URL
3. Your frontend should be at: `https://academy-project-v4vn.vercel.app`

### Step 4: Clear Browser Cache (IMPORTANT!)
After redeployment:
1. Open your deployed site in an **incognito/private window**
2. Or clear browser cache completely:
   - Open DevTools (F12)
   - Application tab → Clear Storage → Clear site data
   - Close and reopen browser

---

## Testing After Redeployment

### Test 1: Backend Health
```bash
curl https://academy-project-94om.onrender.com/api/health
```
Should return: `{"status":"healthy",...}`

### Test 2: Frontend Console Logs
1. Open your Vercel deployment URL
2. Open Browser Console (F12)
3. You should see:
   ```
   [HTML] Page loaded at: [timestamp]
   [LOGIN] ============================================
   [LOGIN] Login component loaded - Build: v2.0.1-[timestamp]
   [LOGIN] Expected backend URL: https://academy-project-94om.onrender.com
   ```

### Test 3: Login Functionality
1. Go to `/login` page
2. Enter name and email
3. Click Login
4. Open Network tab (F12 → Network)
5. Check the request URL - should be:
   `https://academy-project-94om.onrender.com/api/users/login`
6. Should get successful response

---

## Troubleshooting

### Issue: Backend not responding
- Check Render logs: Render Dashboard → Your service → Logs
- Verify environment variables are set
- Check if backend is in "sleep" mode (free tier) - first request may take 30-60 seconds

### Issue: Frontend still showing old code
- Use incognito/private window
- Clear browser cache completely
- Check Vercel deployment logs for build errors
- Verify the deployment shows "Ready" status

### Issue: CORS errors
- Backend CORS is configured to allow all origins
- Check Render logs for CORS-related errors
- Verify backend is accessible: https://academy-project-94om.onrender.com/api/health

### Issue: Login returns 404
- Check Render logs for route registration
- Test: https://academy-project-94om.onrender.com/api/users/test
- Verify userRoutes is loaded (check logs)

---

## Quick Checklist

- [ ] Backend redeployed on Render (with cleared cache)
- [ ] Backend health check passes: `/api/health`
- [ ] Frontend redeployed on Vercel (without build cache)
- [ ] Browser cache cleared (or using incognito)
- [ ] Console shows build version logs
- [ ] Login request uses Render backend URL
- [ ] Login works successfully

---

## Current Backend URL
**Render Backend:** `https://academy-project-94om.onrender.com`

All frontend code is hardcoded to use this URL. No environment variables needed for frontend.

---

## Git Repository
**Branch:** `dev`
**Latest Commit:** `ba323e8` - Fix HTML script tag

All changes are already pushed to the `dev` branch.

