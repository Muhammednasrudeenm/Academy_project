# 🆓 Free Hosting Guide - Complete Instructions

## Best Free Hosting Options (All Free Forever Tier)

### ⭐ Option 1: Firebase Hosting (Recommended - Easiest)
**Why:** You're already using Firebase for database, so it makes sense!
**Free Tier:** ✅ 10GB storage, 360MB/day transfer
**Best For:** Complete Firebase ecosystem

**✅ Already Set Up!** Just need to deploy.

---

### ⭐ Option 2: Vercel (Frontend) + Render (Backend)
**Why:** Most popular, easiest setup
**Free Tier:** ✅ Unlimited frontend, 750hrs/month backend
**Best For:** Quick deployment, great performance

---

### ⭐ Option 3: Netlify (Frontend) + Railway (Backend)
**Why:** Good alternatives
**Free Tier:** ✅ 100GB bandwidth, $5 credits/month
**Best For:** Modern stack

---

## 🚀 Option 1: Firebase Hosting (Easiest - Already Configured)

### Step-by-Step Instructions:

#### 1. Install Firebase CLI (if not done)
```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase
```bash
firebase login
```
- Opens browser
- Sign in with Google
- Authorize Firebase CLI

#### 3. Initialize Firebase
```bash
cd Academy_project-dev
firebase init
```

**Answer the prompts:**
- Select features: **Hosting** (Space), **Functions** (Space), Enter
- Project: **Use existing project** → Select `academyproject-9c6d3`
- Hosting public directory: `frontend/dist`
- Single-page app: **Yes** (y)
- Auto-deploy: **No** (n)
- Functions language: **JavaScript**
- ESLint: **No** (n)
- Install dependencies: **Yes** (y)

#### 4. Deploy
```bash
firebase deploy
```

**Wait 5-10 minutes...**

#### 5. Your App is Live! 🎉
- **URL:** `https://academyproject-9c6d3.web.app`

---

## 🚀 Option 2: Vercel + Render (Popular Choice)

### Part A: Deploy Frontend to Vercel

#### Step 1: Create GitHub Repository
1. Go to: https://github.com/new
2. Create new repository: `academy-app`
3. **Don't** initialize with README
4. Copy the repository URL

#### Step 2: Push Code to GitHub
```bash
cd Academy_project-dev/frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### Step 3: Deploy to Vercel
1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. **Settings:**
   - Framework Preset: **Vite**
   - Root Directory: `frontend` (or leave empty if repo is only frontend)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables:**
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com` (we'll get this next)
7. Click **"Deploy"**
8. Wait 2 minutes
9. **Copy your Vercel URL** (e.g., `https://your-app.vercel.app`)

---

### Part B: Deploy Backend to Render

#### Step 1: Push Backend to GitHub
```bash
cd Academy_project-dev/backend
git init
git add .
git commit -m "Backend initial commit"
git remote add origin YOUR_BACKEND_REPO_URL  # Or same repo, different branch
git push -u origin main
```

#### Step 2: Deploy to Render
1. Go to: https://render.com
2. Sign up (free)
3. Click **"New +"** → **"Web Service"**
4. Connect GitHub → Select your repository
5. **Settings:**
   - Name: `academy-backend`
   - Environment: **Node**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: (leave empty)
6. **Environment Variables:**
   - Click "Add Environment Variable"
   - Add your `.env` variables:
     - `NODE_ENV` = `production`
     - Firebase vars (if using env vars)
7. **For serviceAccountKey.json:**
   - Option A: Use environment variables (convert JSON to env vars)
   - Option B: Upload via Render's file system (if available)
8. Click **"Create Web Service"**
9. Wait 5-10 minutes
10. **Copy your Render URL** (e.g., `https://academy-backend.onrender.com`)

#### Step 3: Update Vercel Environment Variable
1. Go back to Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` = your Render URL
4. Redeploy

#### Step 4: Update Backend CORS
Update `backend/server.js` CORS to include your Vercel URL, then redeploy backend.

---

## 🚀 Option 3: Netlify + Railway

### Frontend → Netlify:
1. Go to: https://www.netlify.com
2. Sign up with GitHub
3. **"Add new site"** → **"Import an existing project"**
4. Connect GitHub → Select repo
5. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Environment variables:**
   - `VITE_API_URL` = your backend URL
7. Deploy

### Backend → Railway:
1. Go to: https://railway.app
2. Sign up with GitHub
3. **"New Project"** → **"Deploy from GitHub"**
4. Select repository
5. Add service → Backend folder
6. Railway auto-detects Node.js
7. Add environment variables
8. Deploy

---

## 📊 Comparison

| Option | Frontend | Backend | Difficulty | Free Tier |
|--------|----------|---------|------------|-----------|
| **Firebase** | ✅ Firebase Hosting | ✅ Cloud Functions | ⭐ Easy | Unlimited |
| **Vercel + Render** | ✅ Vercel | ✅ Render | ⭐⭐ Medium | 750hrs/mo |
| **Netlify + Railway** | ✅ Netlify | ✅ Railway | ⭐⭐ Medium | $5 credits |

---

## 🎯 My Recommendation

**Use Firebase Hosting** because:
- ✅ Already configured
- ✅ Everything in one place (database + hosting)
- ✅ Easiest to deploy
- ✅ Free forever tier
- ✅ Single domain for frontend + API

---

## Quick Start: Firebase (Easiest)

Just run these 3 commands:

```bash
# 1. Login (opens browser)
firebase login

# 2. Initialize (follow prompts)
firebase init

# 3. Deploy
firebase deploy
```

**Done! Your app will be at:** `https://academyproject-9c6d3.web.app`

---

## Need Help?

Which option do you want to use?
- **Firebase** (easiest, already set up)
- **Vercel + Render** (most popular)
- **Netlify + Railway** (good alternatives)

I can help you with any specific step! 🚀

