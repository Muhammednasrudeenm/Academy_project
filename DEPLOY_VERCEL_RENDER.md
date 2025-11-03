# 🚀 Deploy to Vercel (Frontend) + Render (Backend)

Complete guide to deploy your Academy Project using **Vercel** for frontend and **Render** for backend.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Firebase Project** - Already set up
5. **Cloudinary Account** - For image uploads

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/Muhammednasrudeenm/Academy_project.git`
4. Select the repository
5. Configure:
   - **Name**: `academy-project-backend`
   - **Branch**: `dev` (or `main`)
   - **Root Directory**: `Academy_project-dev/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 1.2 Set Environment Variables in Render

Go to **Environment** tab and add:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app-name.vercel.app
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**⚠️ Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace `\n` with actual newlines when pasting (Render will handle this)
- Or use `\\n` in the Render dashboard
- Update `FRONTEND_URL` after deploying frontend

### 1.3 Get Your Backend URL

After deployment, Render will give you a URL like:
```
https://academy-project-backend.onrender.com
```

**⚠️ Note**: Free tier on Render spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `https://github.com/Muhammednasrudeenm/Academy_project.git`
4. Configure:
   - **Project Name**: `academy-project-frontend` (or your choice)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Academy_project-dev/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Update Vercel Configuration

Edit `frontend/vercel.json` and replace:
```json
"destination": "https://your-backend-name.onrender.com/api/$1"
```
with your actual Render backend URL:
```json
"destination": "https://academy-project-backend.onrender.com/api/$1"
```

### 2.3 Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

```env
VITE_API_URL=https://academy-project-backend.onrender.com
```

Or leave it empty to use relative URLs (better with rewrites).

### 2.4 Deploy

Click **"Deploy"**. Vercel will:
1. Build your frontend
2. Deploy it to a URL like: `https://academy-project-frontend.vercel.app`

---

## 🔄 Step 3: Update Backend CORS

After you get your Vercel URL, update the Render backend environment variable:

1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://academy-project-frontend.vercel.app
   ```
4. Click **"Save Changes"** - Render will restart automatically

---

## 🔍 Step 4: Update Frontend API URL (Optional)

If you want to use the Vercel rewrite proxy (recommended):

1. Keep `VITE_API_URL` empty or remove it
2. API calls will automatically go through Vercel's rewrite to Render

Or use direct API calls:
1. Set `VITE_API_URL=https://academy-project-backend.onrender.com` in Vercel
2. Update `vercel.json` rewrites if needed

---

## ✅ Step 5: Verify Deployment

### Test Frontend:
1. Visit your Vercel URL
2. Check browser console for errors
3. Test login functionality

### Test Backend:
1. Visit `https://your-backend.onrender.com/api/test` (if you have a test route)
2. Should return a success response

### Test Full Flow:
1. Create an account
2. Create an academy
3. Post content
4. Upload images

---

## 🔧 Troubleshooting

### Backend Issues:

**Problem**: Backend not starting
- ✅ Check Render logs
- ✅ Verify all environment variables are set
- ✅ Check `package.json` has correct start script

**Problem**: CORS errors
- ✅ Verify `FRONTEND_URL` matches your Vercel URL exactly
- ✅ Check server.js CORS configuration

**Problem**: Firebase connection errors
- ✅ Verify `FIREBASE_PRIVATE_KEY` is correct (with newlines)
- ✅ Check `FIREBASE_PROJECT_ID` matches your Firebase project

### Frontend Issues:

**Problem**: API calls failing
- ✅ Check browser console for errors
- ✅ Verify `VITE_API_URL` or rewrites are correct
- ✅ Check Network tab in DevTools

**Problem**: 404 errors on routes
- ✅ Verify `vercel.json` rewrites are correct
- ✅ Ensure all routes go to `/index.html`

---

## 📊 Monitoring

### Render:
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, Memory usage
- **Uptime**: Free tier may have downtime

### Vercel:
- **Analytics**: Available in dashboard
- **Logs**: Function logs
- **Performance**: Built-in monitoring

---

## 🔄 Continuous Deployment

Both Vercel and Render automatically deploy when you push to your GitHub branch!

**To update:**
```bash
git add .
git commit -m "Your changes"
git push origin dev
```

Vercel and Render will automatically:
1. Detect the push
2. Build the new version
3. Deploy automatically

---

## 🎯 Quick Checklist

### Backend (Render):
- [ ] Created Web Service
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Added all environment variables
- [ ] Got backend URL: `https://xxx.onrender.com`

### Frontend (Vercel):
- [ ] Created project
- [ ] Set root directory to `frontend`
- [ ] Updated `vercel.json` with backend URL
- [ ] Set environment variables (if needed)
- [ ] Got frontend URL: `https://xxx.vercel.app`

### Final Steps:
- [ ] Updated Render `FRONTEND_URL` with Vercel URL
- [ ] Tested login
- [ ] Tested creating academy
- [ ] Tested posting content

---

## 🆘 Support

If you encounter issues:
1. Check Render logs
2. Check Vercel logs
3. Check browser console
4. Verify all environment variables are correct

**Happy Deploying! 🚀**
