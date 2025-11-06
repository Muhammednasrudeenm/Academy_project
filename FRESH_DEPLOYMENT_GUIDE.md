# 🆕 Fresh Deployment Guide - Complete Setup

This guide will help you delete old deployments and create fresh new ones on both Render and Vercel.

---

## 📋 Prerequisites

- ✅ All code is committed and pushed to `dev` branch
- ✅ GitHub repository: `https://github.com/Muhammednasrudeenm/Academy_project.git`
- ✅ Branch: `dev`
- ✅ Backend URL will be: `https://your-new-render-service.onrender.com`
- ✅ Frontend URL will be: `https://your-new-vercel-project.vercel.app`

---

## 🗑️ Step 1: Delete Old Render Deployment

### 1.1 Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Log in to your account
3. Find your old backend service (likely named `academy-project-94om` or similar)

### 1.2 Delete Service
1. Click on your backend service
2. Go to **"Settings"** tab (at the top)
3. Scroll down to **"Danger Zone"**
4. Click **"Delete Service"**
5. Type the service name to confirm
6. Click **"Delete"**

### 1.3 Verify Deletion
- Service should disappear from your dashboard
- This may take a few minutes

---

## 🗑️ Step 2: Delete Old Vercel Project

### 2.1 Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Log in to your account
3. Find your old project (likely named `academy-project-v4vn` or similar)

### 2.2 Delete Project
1. Click on your project
2. Go to **"Settings"** tab
3. Scroll down to **"Danger Zone"**
4. Click **"Delete Project"**
5. Type the project name to confirm
6. Click **"Delete"**

### 2.3 Verify Deletion
- Project should disappear from your dashboard

---

## 🚀 Step 3: Create New Backend on Render

### 3.1 Create New Web Service
1. Go to Render Dashboard: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

### 3.2 Connect Repository
1. If first time: Click **"Connect GitHub"** and authorize
2. Select your repository: `Muhammednasrudeenm/Academy_project`
3. Render will detect your repository

### 3.3 Configure Service
**Service Details:**
- **Name:** `academy-backend` (or any name you prefer)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch:** `dev`
- **Root Directory:** `backend` (important!)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free` (or paid if you prefer)

### 3.4 Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

**Required:**
```
NODE_ENV=production
PORT=5000
```

**Optional (set after you get your Vercel frontend URL):**
```
FRONTEND_URL=https://your-vercel-project.vercel.app
```
> Note: FRONTEND_URL is optional. The backend CORS is configured to allow all origins, so this is mainly for reference or future use.

**For Firebase (if using):**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

**For Cloudinary (if using):**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**📝 Important Notes:**
- Set `FRONTEND_URL` after you create your Vercel frontend (in Step 5)
- You can add it later by going to Render Dashboard → Your Service → Environment → Add Environment Variable
- The backend will work without it since CORS allows all origins

### 3.5 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Note your service URL: `https://your-service-name.onrender.com`

### 3.6 Verify Backend
1. Test health endpoint: `https://your-service-name.onrender.com/api/health`
2. Should return: `{"status":"healthy",...}`
3. Test user routes: `https://your-service-name.onrender.com/api/users/test`
4. Should return: `{"message":"User routes are working! ✅",...}`

**⚠️ IMPORTANT:** Copy your new backend URL! You'll need it for the frontend.

---

## 🚀 Step 4: Update Frontend with New Backend URL

After you get your new Render backend URL, we need to update the frontend code.

**Your new backend URL will be something like:** `https://your-service-name.onrender.com`

### 4.1 Update Login.jsx
The backend URL is hardcoded in:
- `frontend/src/pages/Login.jsx` (line ~42)
- `frontend/src/api/api.js` (line ~6)

We'll update these after you get your new backend URL.

### 4.2 Quick Update Command
After deployment, tell me your new backend URL and I'll update the code for you.

---

## 🚀 Step 5: Create New Frontend on Vercel

### 5.1 Create New Project
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**

### 5.2 Import Repository
1. If first time: Click **"Import Git Repository"** → **"Continue with GitHub"**
2. Select your repository: `Muhammednasrudeenm/Academy_project`
3. Click **"Import"**

### 5.3 Configure Project
**Project Settings:**
- **Project Name:** `academy-frontend` (or any name)
- **Framework Preset:** `Vite` (should auto-detect)
- **Root Directory:** `frontend` (important!)
- **Build Command:** `npm run build` (should auto-fill)
- **Output Directory:** `dist` (should auto-fill)
- **Install Command:** `npm install` (should auto-fill)

### 5.4 Environment Variables (Optional)
For now, we don't need any environment variables since the backend URL is hardcoded.

### 5.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment (1-3 minutes)
3. Your site will be at: `https://your-project-name.vercel.app`

### 5.6 Verify Frontend
1. Open your Vercel URL
2. Open Browser Console (F12)
3. You should see:
   ```
   [LOGIN] Login component loaded - Build: v2.0.1-[timestamp]
   ```

### 5.7 Update Render with Frontend URL (Optional but Recommended)
After you have your Vercel frontend URL:
1. Go to Render Dashboard → Your Backend Service
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   ```
   FRONTEND_URL=https://your-vercel-project.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will automatically redeploy

> **Why?** While not strictly required (CORS allows all origins), it's good practice to have this for reference and potential future use.

---

## 🔄 Step 6: Update Frontend with New Backend URL

After you have both URLs:
1. **New Render Backend URL:** `https://your-service-name.onrender.com`
2. **New Vercel Frontend URL:** `https://your-project-name.vercel.app`

We need to update the frontend code to use the new backend URL.

**Tell me your new backend URL and I'll update:**
- `frontend/src/pages/Login.jsx`
- `frontend/src/api/api.js`
- `frontend/src/pages/Form.jsx` (if it has backend URL)

Then push and redeploy frontend.

---

## ✅ Step 7: Final Testing

### Test 1: Backend Health
```bash
curl https://your-service-name.onrender.com/api/health
```
Should return: `{"status":"healthy",...}`

### Test 2: Frontend Console
1. Open your Vercel URL
2. Open Console (F12)
3. Should see build version logs

### Test 3: Login
1. Go to `/login` page
2. Enter name and email
3. Click Login
4. Open Network tab
5. Check request URL - should be: `https://your-service-name.onrender.com/api/users/login`
6. Should get successful response

---

## 📝 Quick Checklist

- [ ] Old Render service deleted
- [ ] Old Vercel project deleted
- [ ] New Render backend created
- [ ] New Render backend URL noted: `_____________`
- [ ] Backend health check passes
- [ ] Frontend code updated with new backend URL
- [ ] Changes committed and pushed
- [ ] New Vercel frontend created
- [ ] Frontend deployed successfully
- [ ] Login tested and working

---

## 🆘 Troubleshooting

### Backend Issues
- **Service not starting:** Check Render logs
- **Environment variables:** Verify all are set correctly
- **Build errors:** Check Render build logs
- **First request slow:** Free tier sleeps after 15 minutes of inactivity

### Frontend Issues
- **Build fails:** Check Vercel build logs
- **Wrong root directory:** Should be `frontend`
- **404 errors:** Check `vercel.json` configuration
- **CORS errors:** Backend CORS allows all origins

### Connection Issues
- **Login fails:** Verify backend URL is correct in frontend code
- **Network errors:** Check if backend is accessible
- **Cached code:** Use incognito window or clear browser cache

---

## 📞 Next Steps

1. **Delete old deployments** (Render and Vercel)
2. **Create new Render backend** - get the URL
3. **Tell me your new backend URL** - I'll update the code
4. **Push updated code** - I'll help with this
5. **Create new Vercel frontend** - deploy
6. **Test everything** - verify login works

---

## 🔗 Important URLs to Remember

After deployment, save these:
- **Backend URL:** `https://your-service-name.onrender.com`
- **Frontend URL:** `https://your-project-name.vercel.app`
- **Backend Health:** `https://your-service-name.onrender.com/api/health`
- **Backend Test:** `https://your-service-name.onrender.com/api/users/test`

---

**Ready to start? Begin with Step 1: Delete Old Render Deployment**

