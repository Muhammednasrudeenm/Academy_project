# 🚀 Hosting Guide - Free Temporary Hosting

## Recommended Setup (Easiest & Free)

### Option 1: Vercel (Frontend) + Render (Backend) ⭐ RECOMMENDED

**Best for:** Quick deployment, free tier, easy setup

#### Frontend - Vercel (React)
- ✅ Free tier
- ✅ Automatic deployments
- ✅ Easy setup
- ✅ Great for React apps

#### Backend - Render (Express)
- ✅ Free tier (spins down after inactivity)
- ✅ PostgreSQL available (but you're using Firebase)
- ✅ Easy deployment

---

### Option 2: Firebase Hosting (Frontend) + Render (Backend)

**Best for:** Everything in Firebase ecosystem

---

### Option 3: Netlify (Frontend) + Railway (Backend)

**Best for:** Alternative free options

---

## Quick Setup - Vercel + Render (RECOMMENDED)

### Step 1: Deploy Frontend to Vercel (5 minutes)

1. **Push code to GitHub:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to: https://vercel.com
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your repository
   - Select `frontend` folder
   - Framework: Vite/React
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

3. **Environment Variables (if needed):**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend.onrender.com`

---

### Step 2: Deploy Backend to Render (10 minutes)

1. **Push backend to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Render:**
   - Go to: https://render.com
   - Sign up (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: `academy-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Root Directory: `backend`

3. **Environment Variables in Render:**
   - Go to Environment tab
   - Add your `.env` variables:
     - `PORT=5000` (or let Render assign)
     - `MONGO_URI` (if still using MongoDB)
     - Firebase variables (if needed)

4. **Upload serviceAccountKey.json:**
   - Render doesn't support file uploads easily
   - **Better:** Use environment variables for Firebase
   - Or use Render's secret files feature

---

### Step 3: Update Frontend API URL

Update your frontend to use the Render backend URL:

```javascript
// In frontend/src/api/api.js or similar
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
```

---

## Alternative: Firebase Hosting (Frontend + Functions)

### Deploy Frontend to Firebase Hosting:

```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting

# Select:
# - Use existing project (your Firebase project)
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No

npm run build
firebase deploy
```

### Deploy Backend as Firebase Functions:

```bash
cd backend
firebase init functions
# Select Node.js, TypeScript or JavaScript
# Install dependencies
firebase deploy --only functions
```

---

## Quick Start - Railway (Easiest Backend)

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add service → Backend folder
6. Railway auto-detects Node.js
7. Add environment variables
8. Done!

---

## Environment Variables Needed

### Backend (.env):
```
PORT=5000
NODE_ENV=production
```

### Frontend (.env):
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## CORS Configuration

Make sure your backend allows requests from your frontend domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:5173' // For local dev
  ],
  credentials: true
}));
```

---

## Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy frontend (Vercel/Netlify/Firebase)
- [ ] Deploy backend (Render/Railway/Firebase)
- [ ] Update CORS settings
- [ ] Set environment variables
- [ ] Test deployed app
- [ ] Update frontend API URL

---

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Vercel | Unlimited, 100GB bandwidth |
| Render | 750 hours/month, spins down after 15min inactivity |
| Railway | $5 free credits/month |
| Netlify | 100GB bandwidth, 300 build minutes |
| Firebase Hosting | 10GB storage, 360MB/day |

---

## Recommendation

**For fastest setup:** Use **Vercel (frontend) + Render (backend)**

Want me to help you set up a specific option?






