# 🔥 Firebase Deployment Guide

## Setup Steps

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Project

```bash
cd Academy_project-dev
firebase init
```

**Select:**
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Functions: Configure a Cloud Functions directory

**Settings:**
- **Project:** Select your existing Firebase project (the one with Firestore)
- **Hosting public directory:** `frontend/dist`
- **Single-page app:** Yes
- **Functions language:** JavaScript (or TypeScript if you prefer)
- **Functions directory:** `functions`
- **ESLint:** No (or Yes if you want)

### Step 4: Update .firebaserc

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID.

You can find it:
- Firebase Console → Project Settings → Project ID

### Step 5: Update serviceAccountKey.json Path

Since Cloud Functions needs access to Firebase, you have two options:

**Option A: Use Firebase Admin SDK (Automatic - Recommended)**
- Cloud Functions automatically have access to Firebase
- No service account key needed in functions
- Update `functions/index.js` to use default credentials

**Option B: Use Service Account (Current Setup)**
- Copy `backend/config/serviceAccountKey.json` to `functions/`
- Or use environment variables

### Step 6: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

### Step 7: Deploy Everything

```bash
firebase deploy
```

Or deploy separately:
```bash
# Deploy only hosting (frontend)
firebase deploy --only hosting

# Deploy only functions (backend)
firebase deploy --only functions

# Deploy both
firebase deploy
```

---

## Environment Variables

### For Functions (Backend):

Set environment variables in Firebase:

```bash
firebase functions:config:set cloudinary.cloud_name="your-cloud-name"
firebase functions:config:set cloudinary.api_key="your-api-key"
firebase functions:config:set cloudinary.api_secret="your-api-secret"
```

Or use Firebase Console:
- Functions → Configuration → Environment Variables

---

## Important: Update Firebase Config

The functions need to access Firebase Admin SDK. Since you're already in Firebase, we can use default credentials.

Update `functions/index.js` or create `functions/config/firebase.js`:

```javascript
import admin from 'firebase-admin';

// Cloud Functions automatically have access to Firebase
// No service account key needed!
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export default admin;
```

---

## Deployment Commands

```bash
# Build frontend
cd frontend && npm run build && cd ..

# Deploy everything
firebase deploy

# Deploy only frontend
firebase deploy --only hosting

# Deploy only backend
firebase deploy --only functions

# View logs
firebase functions:log

# View functions
firebase functions:list
```

---

## After Deployment

### Frontend URL:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

### Backend API URL:
- `https://your-region-your-project-id.cloudfunctions.net/api`

Update your frontend `.env`:
```env
VITE_API_URL=https://your-region-your-project-id.cloudfunctions.net/api
```

Or update `firebase.json` to route `/api/*` to functions automatically (already configured).

---

## Troubleshooting

### Error: "Functions directory not found"
- Make sure `functions/` folder exists
- Run `firebase init functions` again

### Error: "Service account not found"
- Use default Firebase credentials (no service account needed in Cloud Functions)
- Or copy serviceAccountKey.json to functions/

### Error: "Build failed"
- Check Node version (should be 20 for Firebase Functions)
- Run `npm install` in functions directory

### CORS Errors:
- Update CORS in `functions/index.js`
- Add your Firebase hosting domain

---

## Cost Estimate (Free Tier)

- **Hosting:** 10GB storage, 360MB/day transfer (FREE)
- **Functions:** 2 million invocations/month (FREE)
- **Firestore:** 50K reads/day, 20K writes/day (FREE)

**Total:** FREE for development/small apps! 🎉

---

## Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "Frontend: https://your-project-id.web.app"
echo "Backend API: https://your-region-your-project-id.cloudfunctions.net/api"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**Ready to deploy! Follow the steps above. 🚀**


