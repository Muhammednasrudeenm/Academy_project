# 🚀 Vercel + Render Setup - Complete Guide

## ✅ Recommendation: Vercel (Frontend) + Render (Backend)

**Why:**
- ✅ Both have generous free tiers
- ✅ Easy to set up
- ✅ Great performance
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificates

---

## 📋 Step-by-Step Instructions

### STEP 1: Prepare GitHub Repositories

#### Option A: Two Separate Repos (Recommended)

**Frontend Repo:**
1. Go to: https://github.com/new
2. Name: `academy-frontend`
3. Don't initialize with README
4. Create repository

**Backend Repo:**
1. Go to: https://github.com/new
2. Name: `academy-backend`
3. Don't initialize with README
4. Create repository

---

### STEP 2: Push Frontend to GitHub

```bash
cd Academy_project-dev/frontend

# Initialize git
git init
git add .
git commit -m "Initial commit - Frontend"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/academy-frontend.git

# Push
git branch -M main
git push -u origin main
```

---

### STEP 3: Push Backend to GitHub

```bash
cd Academy_project-dev/backend

# Initialize git
git init
git add .
git commit -m "Initial commit - Backend"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/academy-backend.git

# Push
git branch -M main
git push -u origin main
```

---

### STEP 4: Deploy Frontend to Vercel

1. **Sign up:** https://vercel.com (use GitHub)

2. **Import Project:**
   - Click "Add New Project"
   - Select your `academy-frontend` repository
   - Click "Import"

3. **Configuration (Auto-detected):**
   - Framework Preset: **Vite** ✅
   - Root Directory: (leave empty)
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅

4. **Environment Variables:**
   - Click "Environment Variables"
   - Add:
     - **Key:** `VITE_API_URL`
     - **Value:** `https://academy-backend.onrender.com` (we'll update this after backend deploys)
   - Click "Add"

5. **Deploy:**
   - Click "Deploy"
   - Wait 2 minutes
   - ✅ Copy your Vercel URL: `https://academy-frontend.vercel.app`

---

### STEP 5: Deploy Backend to Render

1. **Sign up:** https://render.com (use GitHub)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub → Select `academy-backend` repository

3. **Configuration:**
   - **Name:** `academy-backend`
   - **Environment:** Node
   - **Region:** Choose closest (e.g., Oregon)
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables:**
   Click "Add Environment Variable" and add:
   
   **Required:**
   - `NODE_ENV` = `production`
   - `FIREBASE_PROJECT_ID` = `academyproject-9c6d3`
   - `FIREBASE_CLIENT_EMAIL` = (from serviceAccountKey.json - line 3: "client_email")
   - `FIREBASE_PRIVATE_KEY` = (from serviceAccountKey.json - line 8: "private_key" - copy entire value including -----BEGIN and -----END)
   - `FRONTEND_URL` = `https://academy-frontend.vercel.app` (your Vercel URL)

   **Optional (Cloudinary):**
   - `CLOUDINARY_CLOUD_NAME` = (your cloudinary name)
   - `CLOUDINARY_API_KEY` = (your api key)
   - `CLOUDINARY_API_SECRET` = (your api secret)

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment
   - ✅ Copy your Render URL: `https://academy-backend.onrender.com`

---

### STEP 6: Update Frontend API URL

1. Go back to **Vercel**
2. Settings → Environment Variables
3. Edit `VITE_API_URL`
4. Update to: `https://academy-backend.onrender.com` (your actual Render URL)
5. Save
6. Go to Deployments → Click "..." → "Redeploy"

---

### STEP 7: Update Backend CORS (Optional)

The backend already has Vercel domains in CORS, so it should work automatically!

If you get CORS errors, update `backend/server.js` CORS to include your exact Vercel URL.

---

## 🎉 After Deployment

### Your Live URLs:
- **Frontend:** `https://academy-frontend.vercel.app`
- **Backend:** `https://academy-backend.onrender.com`
- **API:** `https://academy-backend.onrender.com/api/*`

---

## 📝 Get Firebase Credentials for Render

From your `serviceAccountKey.json`:

1. **FIREBASE_PROJECT_ID:** Line 3: `"project_id"`
2. **FIREBASE_CLIENT_EMAIL:** Line 4: `"client_email"`
3. **FIREBASE_PRIVATE_KEY:** Line 8: `"private_key"` (copy entire value)

**Important:** For private key, copy everything including:
```
-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----
```

Keep the `\n` characters - Render will handle them correctly.

---

## ✅ What's Ready:

- ✅ Backend supports environment variables (updated `firebase.js`)
- ✅ CORS configured for Vercel
- ✅ Frontend uses `VITE_API_URL` env var
- ✅ All configuration done

---

## Quick Checklist:

- [ ] Create 2 GitHub repositories
- [ ] Push frontend code
- [ ] Push backend code
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Add environment variables in Render
- [ ] Update Vercel env var with Render URL
- [ ] Test your live app!

---

**Estimated Time:** 20-30 minutes total

**Need help with any step? Let me know!** 🚀

