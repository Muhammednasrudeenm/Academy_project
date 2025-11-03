# ⚡ Quick Deploy Guide (15 Minutes)

## Option 1: Vercel + Render (Recommended)

### Backend → Render (10 min)

1. **Sign up:** https://render.com
2. **New Web Service:**
   - Connect GitHub
   - Select your repo
   - **Settings:**
     - Name: `academy-api`
     - Environment: `Node`
     - Build: `cd backend && npm install`
     - Start: `cd backend && npm start`
3. **Environment Variables:**
   - Add your Firebase service account key data
   - Or upload `serviceAccountKey.json` file
4. **Deploy** → Get URL: `https://academy-api.onrender.com`

### Frontend → Vercel (5 min)

1. **Sign up:** https://vercel.com (use GitHub)
2. **New Project:**
   - Import GitHub repo
   - **Settings:**
     - Framework: Vite
     - Root: `frontend`
     - Build: `npm run build`
     - Output: `dist`
3. **Environment Variables:**
   - `VITE_API_URL` = `https://academy-api.onrender.com`
4. **Deploy** → Get URL: `https://your-app.vercel.app`

### Update CORS in Backend

After getting Vercel URL, update `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app', // Your Vercel URL
  ],
  credentials: true
}));
```

Redeploy backend.

---

## Option 2: Railway (Easiest - All-in-One)

1. **Sign up:** https://railway.app (GitHub)
2. **New Project** → Deploy from GitHub
3. **Add Service:**
   - **Backend:** Select `backend` folder
   - Add environment variables
   - Deploy
4. **Add Service:**
   - **Frontend:** Select `frontend` folder  
   - Set environment variables
   - Deploy

Both services get URLs automatically!

---

## Option 3: Firebase Hosting (Frontend) + Render (Backend)

### Frontend:
```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
# Select: dist, yes to SPA
npm run build
firebase deploy
```

### Backend:
Same as Render steps above.

---

## Important: Update These Files

✅ Already done:
- `frontend/src/api/api.js` - Now uses `VITE_API_URL` env var
- Frontend will automatically use production URL when deployed

📝 You need to:
1. Set `VITE_API_URL` in Vercel/Railway/Netlify
2. Update CORS in backend with your frontend URL
3. Push code to GitHub first

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed (Render/Railway)
- [ ] Frontend deployed (Vercel/Railway/Firebase)
- [ ] Environment variables set
- [ ] CORS updated with frontend URL
- [ ] Test deployed app

---

**Need help with a specific step? Let me know!**



