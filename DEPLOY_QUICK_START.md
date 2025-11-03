# ⚡ Quick Start - Deploy in 10 Minutes

## 🎯 Backend (Render) - 5 minutes

1. **Sign up**: [render.com](https://render.com)
2. **New** → **Web Service** → Connect GitHub repo
3. **Settings**:
   - Name: `academy-backend`
   - Root Directory: `Academy_project-dev/backend`
   - Build: `npm install`
   - Start: `npm start`
4. **Environment** tab → Add variables (see `ENVIRONMENT_VARIABLES.md`)
5. **Create** → Wait for deploy
6. **Copy URL**: `https://xxx.onrender.com`

---

## 🎨 Frontend (Vercel) - 5 minutes

1. **Sign up**: [vercel.com](https://vercel.com)
2. **Add New** → **Project** → Import GitHub repo
3. **Settings**:
   - Root Directory: `Academy_project-dev/frontend`
   - Framework: `Vite` (auto-detected)
4. **Before deploying**: Edit `vercel.json` → Replace `YOUR-BACKEND-NAME` with your Render backend name
5. **Deploy** → Wait
6. **Copy URL**: `https://xxx.vercel.app`

---

## 🔗 Connect Them - 2 minutes

1. Go back to **Render** → Your backend service
2. **Environment** → Update `FRONTEND_URL` = Your Vercel URL
3. **Save** → Auto-restarts

---

## ✅ Test

Visit your Vercel URL → Should work!

---

## 📚 Full Guide

See `DEPLOY_VERCEL_RENDER.md` for detailed instructions.


