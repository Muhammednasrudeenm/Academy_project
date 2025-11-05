# 🚀 Vercel Deployment Guide - Step by Step

## Best Free Hosting Recommendation: Vercel + Render ⭐

**Why This Combo:**
- ✅ **Vercel** - Best for React/Vite frontend (unlimited free tier)
- ✅ **Render** - Reliable free backend hosting
- ✅ Easy setup, great performance
- ✅ Both have generous free tiers

---

## 📋 Complete Deployment Steps

### Part 1: Frontend → Vercel (10 minutes)

#### Step 1: Push Code to GitHub

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Repository name: `academy-app` (or any name)
   - **Don't** initialize with README
   - Click "Create repository"
   - **Copy the repository URL**

2. **Push Frontend to GitHub:**
   ```bash
   cd Academy_project-dev/frontend
   git init
   git add .
   git commit -m "Initial commit - Frontend"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

#### Step 2: Deploy to Vercel

1. **Sign up:**
   - Go to: https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel

2. **Import Project:**
   - Click "Add New Project" or "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `frontend` (if your repo has backend too) OR leave empty (if repo is only frontend)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

4. **Environment Variables:**
   - Click "Environment Variables"
   - Add: 
     - **Name:** `VITE_API_URL`
     - **Value:** `https://your-backend.onrender.com` (we'll get this from Render)
   - Click "Add"
   - For now, you can add: `https://placeholder.onrender.com` (update after backend deploys)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - ✅ **Copy your Vercel URL** (e.g., `https://academy-app.vercel.app`)

---

### Part 2: Backend → Render (15 minutes)

#### Step 1: Push Backend to GitHub

**Option A: Separate Repository (Recommended)**
1. Create new repo: `academy-backend`
2. Push backend:
   ```bash
   cd Academy_project-dev/backend
   git init
   git add .
   git commit -m "Backend initial commit"
   git remote add origin YOUR_BACKEND_REPO_URL
   git push -u origin main
   ```

**Option B: Same Repository (Subfolder)**
- Keep backend in the same repo but different branch or folder
- Render can deploy from subdirectory

#### Step 2: Deploy to Render

1. **Sign up:**
   - Go to: https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" button (top right)
   - Select "Web Service"
   - Click "Connect account" if needed
   - Select your GitHub repository

3. **Configure Service:**
   - **Name:** `academy-backend` (or any name)
   - **Environment:** Node
   - **Region:** Choose closest to you
   - **Branch:** `main` (or `master`)
   - **Root Directory:** (leave empty if backend is root, or `backend` if in subfolder)
   - **Build Command:** `npm install` or `cd backend && npm install`
   - **Start Command:** `npm start` or `cd backend && npm start`
   - **Plan:** Free

4. **Environment Variables:**
   - Click "Environment" tab
   - Click "Add Environment Variable"
   - Add these:
     - **NODE_ENV** = `production`
     - **PORT** = (leave empty, Render sets this automatically)
     - **FRONTEND_URL** = `https://your-app.vercel.app` (your Vercel URL from Part 1)
   
   **For Firebase (if using service account):**
   - Option 1: Copy `serviceAccountKey.json` content and create env vars
   - Option 2: Use Render's secret files (if available)
   - Option 3: Convert JSON to individual env vars

5. **For serviceAccountKey.json:**
   Since Render doesn't easily support file uploads, convert to environment variables:
   
   Create these env vars in Render:
   ```
   FIREBASE_PROJECT_ID=academyproject-9c6d3
   FIREBASE_CLIENT_EMAIL=(from serviceAccountKey.json)
   FIREBASE_PRIVATE_KEY=(from serviceAccountKey.json)
   ```
   
   Then update `backend/config/firebase.js` to use env vars instead of file.

6. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment
   - ✅ **Copy your Render URL** (e.g., `https://academy-backend.onrender.com`)

---

### Part 3: Update Frontend API URL

1. **Go back to Vercel:**
   - Settings → Environment Variables
   - Edit `VITE_API_URL`
   - Change to: `https://your-backend.onrender.com` (your actual Render URL)
   - Click "Save"

2. **Redeploy Frontend:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### Part 4: Update Backend CORS

Update `backend/server.js` to include your Vercel URL, then redeploy backend on Render.

---

## 🔧 Update Backend for Environment Variables

Since Render doesn't easily support `serviceAccountKey.json`, let's update the Firebase config:

I'll create a version that uses environment variables.

---

## 📊 After Deployment

### Your URLs:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://academy-backend.onrender.com`
- **API:** `https://academy-backend.onrender.com/api/*`

### Test:
1. Visit your Vercel URL
2. Test login
3. Create an academy
4. Everything should work! 🎉

---

## Free Tier Limits:

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL

**Render:**
- ✅ 750 hours/month (free tier)
- ✅ Spins down after 15 min inactivity (first request takes ~30s)
- ✅ 512MB RAM

**Both:** Completely free for development! 🎉

---

## Next Steps:

1. **Create GitHub repos**
2. **Push code to GitHub**
3. **Deploy frontend to Vercel**
4. **Deploy backend to Render**
5. **Update URLs**
6. **Done!** 🎉

---

**Want me to help update the Firebase config to use environment variables for Render?**





