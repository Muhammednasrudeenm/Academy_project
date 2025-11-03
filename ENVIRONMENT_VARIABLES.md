# 🔐 Environment Variables Guide

## Backend (Render) - Required Variables

Add these in **Render Dashboard** → **Environment** tab:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URL (Update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### How to Get Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Copy values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and \n)

**⚠️ Important for FIREBASE_PRIVATE_KEY:**
- Keep the quotes: `"-----BEGIN...KEY-----"`
- In Render, you can use `\n` for newlines, or paste with actual line breaks
- Render will handle the formatting

### How to Get Cloudinary Credentials:

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Copy from **Dashboard**:
   - Cloud Name
   - API Key
   - API Secret

---

## Frontend (Vercel) - Optional Variables

```env
# API URL (optional - if not using rewrites)
VITE_API_URL=https://academy-project-backend.onrender.com
```

**Note**: If you use Vercel rewrites (in `vercel.json`), you can leave this empty or don't set it. The rewrites will handle API calls automatically.

---

## 📝 Setting Variables

### Render:
1. Go to your service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Enter key and value
5. Click **"Save Changes"** (restarts service)

### Vercel:
1. Go to your project
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add variable for **Production** environment
5. Save (redeploys automatically)

---

## ✅ Verification

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/academies
```

### Test Frontend:
Visit your Vercel URL and check browser console for API errors.

---

## 🔒 Security Notes

1. **Never commit** environment variables to git
2. **Never commit** `serviceAccountKey.json`
3. Always use environment variables in production
4. Keep sensitive keys in service dashboards only


