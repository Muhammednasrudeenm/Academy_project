# 🚀 Quick Deploy Guide - Vercel + Render

## Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `https://github.com/Muhammednasrudeenm/Academy_project.git`
4. Configure:
   - **Name**: `academy-backend`
   - **Root Directory**: `Academy_project-dev/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Add Environment Variables** in Render:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-url.vercel.app (update after frontend deploy)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

6. **Click "Create Web Service"** - Wait for deployment
7. **Copy your Render URL**: `https://academy-backend.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `https://github.com/Muhammednasrudeenm/Academy_project.git`
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Academy_project-dev/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Update vercel.json**:
   - Open `frontend/vercel.json`
   - Replace `your-backend-name.onrender.com` with your actual Render URL

6. **Add Environment Variable** (optional):
   ```
   VITE_API_URL=https://academy-backend.onrender.com
   ```
   (Or leave empty to use rewrites)

7. **Click "Deploy"** - Wait for deployment
8. **Copy your Vercel URL**: `https://academy-frontend.vercel.app`

---

## Step 3: Link Frontend and Backend

1. Go back to **Render Dashboard**
2. Edit your backend service
3. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://academy-frontend.vercel.app
   ```
4. Save - Render will restart automatically

---

## Step 4: Test

1. Visit your Vercel URL
2. Test login/signup
3. Test creating an academy
4. Test posting content

**Done! 🎉**

---

## 🔄 Auto-Deploy

Both services auto-deploy when you push to GitHub!

```bash
git add .
git commit -m "Update"
git push origin dev
```

---

## ⚠️ Important Notes

1. **Render Free Tier**: Spins down after 15 min inactivity. First request takes ~30 seconds.
2. **Vercel**: Free tier is very generous, perfect for frontend.
3. **Environment Variables**: Keep sensitive keys in service dashboards, never commit them.
4. **CORS**: Must match exact frontend URL in Render backend settings.





