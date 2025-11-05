# 🚀 Quick Firebase Deployment Steps

## Prerequisites

1. ✅ Firebase project already created (you have serviceAccountKey.json)
2. ✅ Firestore database enabled
3. ✅ Node.js installed

---

## Step 1: Install Firebase CLI (2 min)

```bash
npm install -g firebase-tools
```

---

## Step 2: Login to Firebase (1 min)

```bash
firebase login
```

This opens browser - sign in with your Google account.

---

## Step 3: Initialize Firebase (5 min)

```bash
cd Academy_project-dev
firebase init
```

**When prompted:**

1. **Select features:**
   - ✅ **Hosting** (Space to select, Enter to confirm)
   - ✅ **Functions** (Space to select, Enter to confirm)
   - Press Enter to continue

2. **Select a Firebase project:**
   - Select your existing project (the one with Firestore)

3. **Hosting:**
   - Public directory: `frontend/dist`
   - Single-page app: **Yes** ✅
   - GitHub auto-deploy: **No** (or Yes if you want)

4. **Functions:**
   - Language: **JavaScript** ✅
   - ESLint: **No** (or Yes)
   - Install dependencies: **Yes** ✅

---

## Step 4: Update Project ID

Edit `.firebaserc`:
- Replace `your-project-id` with your actual Firebase project ID
- Find it in: Firebase Console → Project Settings → Project ID

---

## Step 5: Copy Backend Files to Functions

Since Cloud Functions needs the backend code:

**Option 1: Symlink (Recommended)**
```bash
# Windows (PowerShell as Admin)
New-Item -ItemType SymbolicLink -Path "functions/backend" -Target "backend"

# Mac/Linux
ln -s ../backend functions/backend
```

**Option 2: Manual Copy (I'll update functions/index.js to import correctly)**

The current setup in `functions/index.js` imports from `../backend/` which should work.

---

## Step 6: Install Dependencies

```bash
# Install functions dependencies
cd functions
npm install
cd ..

# Build frontend
cd frontend
npm run build
cd ..
```

---

## Step 7: Update Frontend API URL

After deployment, your API will be at:
```
https://YOUR-REGION-YOUR-PROJECT-ID.cloudfunctions.net/api
```

But with the rewrite rule in `firebase.json`, it will be accessible at:
```
/api
```

So update `frontend/.env.production` or in Firebase Hosting environment:
```env
VITE_API_URL=
```

This makes it use relative URLs (`/api`) which works with Firebase Hosting rewrites!

Or update `frontend/src/api/api.js`:
```javascript
// Use relative URL for Firebase Hosting
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:5000');
```

Actually, let me update that file for you.

---

## Step 8: Deploy!

```bash
firebase deploy
```

Wait 5-10 minutes for first deployment.

---

## Your URLs After Deployment:

**Frontend:**
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

**Backend API:**
- Accessible at: `https://your-project-id.web.app/api/*`
- Direct: `https://your-region-your-project-id.cloudfunctions.net/api`

---

## Troubleshooting

### "Functions directory not found"
- Make sure `functions/` folder exists
- Run `firebase init functions` again

### "Cannot find module '../backend/...'"
- Make sure backend files are accessible from functions
- Or update import paths in `functions/index.js`

### Build Errors
- Check Node version (should be 20)
- Run `npm install` in both `functions/` and `frontend/`

---

## Quick Commands Reference

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
```

---

**Ready! Start with Step 1. 🚀**






