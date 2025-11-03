# ⚡ Quick Start: Vercel + Render Deployment

## ✅ Recommendation: Vercel + Render

**Best free hosting combo:**
- **Vercel** → Frontend (unlimited free tier)
- **Render** → Backend (750 hours/month free)

---

## 🚀 7 Simple Steps

### 1. Create GitHub Repos (2 minutes)
- Go to: https://github.com/new
- Create: `academy-frontend` (public or private)
- Create: `academy-backend` (public or private)
- Don't initialize with README

### 2. Push Frontend (2 minutes)
```bash
cd Academy_project-dev/frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/academy-frontend.git
git branch -M main
git push -u origin main
```

### 3. Push Backend (2 minutes)
```bash
cd Academy_project-dev/backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/academy-backend.git
git branch -M main
git push -u origin main
```

### 4. Deploy Frontend to Vercel (3 minutes)
1. Go to: https://vercel.com → Sign up with GitHub
2. "Add New Project" → Select `academy-frontend`
3. Settings (auto-detected):
   - Framework: Vite ✅
   - Build: `npm run build` ✅
   - Output: `dist` ✅
4. Environment Variables:
   - Add: `VITE_API_URL` = `https://academy-backend.onrender.com` (update after backend deploys)
5. Deploy → Copy URL: `https://academy-frontend.vercel.app`

### 5. Deploy Backend to Render (10 minutes)
1. Go to: https://render.com → Sign up with GitHub
2. "New +" → "Web Service" → Select `academy-backend`
3. Settings:
   - Name: `academy-backend`
   - Environment: **Node**
   - Build: `npm install`
   - Start: `npm start`
   - Plan: **Free**
4. Environment Variables (click "Add"):
   ```
   NODE_ENV = production
   FIREBASE_PROJECT_ID = academyproject-9c6d3
   FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@academyproject-9c6d3.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6HUCum73wH+k4\n5q9VlpLn6NPQGe5WoTnbXvYjbB8C2dP266mX9xBCdUOwfbF53XIz5MRPhLjDTJrq\netHpbI+AB5LCKq6pahEIEwQEnRTjSxGrrD448IXrpJPKdV5bng1e7+C8W37lpmbH\nvaBl4Th3mQJ40ls0o3DWW/0jiHKkRljof7osFw4Q7nm6wtE3oOql5LKcaEVsCuPl\ns9D6TESgj2te8NRBrxVjkYBKkYfordY2LdSKUtnUC0JfRqAS8YW6hpvviE7VFvpi\n/IUYBfxskofHSnhDT61GdpT/r+Y7tnkzXoxIjw5xyDdTPhUwGGdNnolAofSDVDb0\nnTclEXvLAgMBAAECggEAEGbGjfy0ouY1B+owdnL0FFLs47B9VA4WSrJWL632F6q5\nps+C3R0NRkYORo31J3+v8knNURKps7BbEKHtQMxr4wUH1murg8uQn60JVBzBu/wg\nHQhrXVo4+xjAW323aIyHsh+ipwbLKpLdCOo5qfDMqKGH2bz0A7IJniJyLwD11Wsl\nFDoKPhoaAKZbhb2wKXMJmENNSI+hx0uE/478vb8tjUoDxNeNV9cxk+05MlLxaFAr\na0cYHdl2emJXAoqEeDb3nh4kIDXh1UDsqPa5RxHzQjU2fVLmn5ueLDfeYoGK6Bra\nQHWYq2T5MByzXMlHfALKdZTcLx/+FNtJ/Qvoq6yHRQKBgQDq5AF9/xKB2UlWh5wF\n6KcvbhX66mVwApj471BQj+teaNHoyc4l06H9h9b9Uqe55zkQnoafeQMYogS8P6iW\nD0xEzLJpG1IxCi4f7LdojZhtgWLIPCQEa+HiQqQXq24gEgx6POF/s3C2o++pNzG7\nFYi0y3W2aWjSHrcNKJY4iXK3JQKBgQDK1xOiZ9Ju+Uknt3PsnN4/bTlRScMUOVEa\nrM8+KUS3p9XuQTa1SGrd4Ct9sQ2nTGgVpV8HSD/CzENSEaGsXfX6KP3UzLhXf3qZ\nLQzJIUGjvpi+699hIssKbemlGCe8pgG+dLYLrJrClGIekNxm/VERMVGAmJV6B9Mu\nK5jQkpGsLwKBgGk1Gt3+Y6G5Wzngn6ed31RFMJ8kYa7b2vyU5BpRfBDbTjnAOg+D\nTSkrsMXiQbHouQySlKXVI+fimdBfivk7fOPL85VUYWoJr0MpWbUAxuc1brNVDKTW\nVWRsiOb5J+hBbUlK/42dJ70GjI/0Ytfy+zpPbzf22rZSf5brOO210qXpAoGAeE0p\nOvgiiWjWJ3UZjurWsX2BMiHyTktUO+LkIzTsqZQkQGNzI/9oSmGKycg5ldCuJrBm\n9PW3wzvMbZ9BaO5tVcn8CbrFVjeoKbLbU2qi+I+xHgLdAEpXa78WhLEX2D4I6MFl\nuvTK8L56lzBJV9fDvdOnSAK3HKIJcOewgXt8ZEcCgYEA3p6JyPpdHzEXBHcD33fq\nXeN3H0NtpHHb1LbqWMiFtDDBBwiKsw4AdKJfJw6yb7mi96AU3nC141QWAiglSdb6\nZHuawnwPxhHccw62lSqVBukab7AAR9TAH+zZZ0FXKcKElxBV9NZemp/QjNR0SkYR\nB0yyAdoHGGTcYN89oxkA5KQ=\n-----END PRIVATE KEY-----\n
   FRONTEND_URL = https://academy-frontend.vercel.app
   ```
   *(Copy private key from serviceAccountKey.json line 5 - keep the \n characters)*
5. Create Web Service → Wait 5-10 min
6. Copy URL: `https://academy-backend.onrender.com`

### 6. Update Frontend API URL (1 minute)
1. Vercel → Settings → Environment Variables
2. Edit `VITE_API_URL` → Update to your Render URL
3. Deployments → "..." → "Redeploy"

### 7. Test! 🎉
- Visit: `https://academy-frontend.vercel.app`
- Try login, create academy, etc.

---

## 📊 Your Live URLs:
- **Frontend:** `https://academy-frontend.vercel.app`
- **Backend:** `https://academy-backend.onrender.com`

---

## ⚠️ Important Notes:

1. **Render Free Tier:** Service sleeps after 15 min inactivity
   - First request after sleep takes ~30 seconds to wake up
   - Normal requests are instant

2. **Private Key Format:** When adding `FIREBASE_PRIVATE_KEY` in Render:
   - Copy the ENTIRE value from serviceAccountKey.json (line 5)
   - Keep the `\n` characters - Render handles them correctly

3. **CORS:** Already configured for Vercel domains ✅

---

## ✅ What's Ready:
- ✅ Firebase config supports environment variables
- ✅ Backend ready for Render
- ✅ Frontend ready for Vercel
- ✅ CORS configured

**Total time: ~20 minutes**

**Follow the steps above and you're live! 🚀**

