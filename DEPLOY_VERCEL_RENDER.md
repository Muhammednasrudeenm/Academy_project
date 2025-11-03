# 🚀 Quick Deploy: Vercel + Render

## Step-by-Step Deployment

### Part 1: Prepare Your Code

#### 1.1 Update Frontend API URL

Create `frontend/.env.production`:
```env
VITE_API_URL=https://academy-backend.onrender.com
```

Update your API calls to use environment variable:
```javascript
// frontend/src/api/api.js (or wherever you make API calls)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

#### 1.2 Update Backend CORS

Update `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app', // Will update after Vercel deploy
    /\.vercel\.app$/, // Allow all Vercel previews
  ],
  credentials: true
}));
```

#### 1.3 Prepare serviceAccountKey.json

**Option A: Use Environment Variables (Recommended)**
Convert Firebase service account to env vars in Render.

**Option B: Keep file (Render supports file uploads)**
Keep `serviceAccountKey.json` in backend.

---

### Part 2: Deploy Backend to Render

1. **Sign up:** https://render.com (free)
2. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Select repository
   - Settings:
     - **Name:** `academy-backend`
     - **Environment:** `Node`
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && npm start`
     - **Root Directory:** (leave empty, or set to `backend`)
3. **Environment Variables:**
   - Add variables from your `.env`
   - For Firebase: Add service account as env vars or use file
4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (~5 minutes)
   - Note your URL: `https://academy-backend.onrender.com`

---

### Part 3: Deploy Frontend to Vercel

1. **Sign up:** https://vercel.com (use GitHub)
2. **Import Project:**
   - Click "Add New Project"
   - Import from GitHub
   - Select your repository
3. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Environment Variables:**
   - `VITE_API_URL` = `https://academy-backend.onrender.com`
5. **Deploy:**
   - Click "Deploy"
   - Wait (~2 minutes)
   - Get your URL: `https://your-app.vercel.app`

---

### Part 4: Update CORS

After getting Vercel URL, update backend CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app', // Your actual Vercel URL
    /\.vercel\.app$/,
  ],
  credentials: true
}));
```

Redeploy backend on Render.

---

## Quick Commands

### Initialize Git (if not already):
```bash
# Frontend
cd frontend
git init
git add .
git commit -m "Ready for deployment"

# Backend  
cd backend
git init
git add .
git commit -m "Backend ready"
```

### Push to GitHub:
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Troubleshooting

### Render Backend:
- **Spins down:** First request takes 30-60 seconds (free tier)
- **CORS errors:** Update CORS with Vercel URL
- **Port:** Render sets PORT automatically

### Vercel Frontend:
- **Build fails:** Check Node version (should be 18+)
- **API errors:** Verify `VITE_API_URL` is set
- **404 errors:** Make sure "Single Page App" is enabled

---

## Environment Variables Checklist

### Backend (Render):
```
NODE_ENV=production
PORT=5000 (optional, Render sets this)
# Firebase vars if using env vars instead of file
```

### Frontend (Vercel):
```
VITE_API_URL=https://academy-backend.onrender.com
```

---

## After Deployment

1. ✅ Test frontend URL
2. ✅ Test backend API: `https://academy-backend.onrender.com/api/debug`
3. ✅ Test full flow: Login → View Academies → Create Academy
4. ✅ Check browser console for errors
5. ✅ Update CORS with actual URLs

---

**Estimated Time:** 15-20 minutes total

Want me to help you with a specific step?


