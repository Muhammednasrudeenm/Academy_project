# ✅ Firebase Deployment Checklist

## Pre-Deployment Setup

### 1. Install Firebase CLI ✅
```bash
npm install -g firebase-tools
```

### 2. Login ✅
```bash
firebase login
```

### 3. Initialize Firebase ✅
```bash
cd Academy_project-dev
firebase init
```

**Select:**
- ✅ Hosting
- ✅ Functions

**Settings:**
- Project: Your existing Firebase project
- Hosting directory: `frontend/dist`
- Single-page app: Yes
- Functions language: JavaScript
- Functions directory: `functions`

### 4. Update .firebaserc ✅
- Edit `.firebaserc`
- Replace `your-project-id` with your actual Firebase project ID

### 5. Install Dependencies ✅
```bash
# Functions
cd functions
npm install
cd ..

# Frontend (if not already)
cd frontend
npm install
cd ..
```

### 6. Build Frontend ✅
```bash
cd frontend
npm run build
cd ..
```

---

## Files Created ✅

- ✅ `firebase.json` - Firebase configuration
- ✅ `functions/index.js` - Cloud Functions entry point
- ✅ `functions/package.json` - Functions dependencies
- ✅ `functions/config/firebase.js` - Firebase config for Functions
- ✅ `.firebaserc` - Project ID configuration
- ✅ `.firebaseignore` - Files to ignore during deployment
- ✅ Frontend API updated to use relative URLs

---

## Deployment Steps

### Step 1: Update .firebaserc
Edit `.firebaserc` and add your Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### Step 2: Deploy
```bash
firebase deploy
```

This will:
1. Build functions
2. Deploy functions to Cloud Functions
3. Deploy frontend to Firebase Hosting

**First deployment takes 5-10 minutes!**

---

## After Deployment

### Your URLs:
- **Frontend:** `https://your-project-id.web.app`
- **API:** `https://your-project-id.web.app/api/*` (via rewrites)

### Test:
1. Visit your frontend URL
2. Test login
3. Create an academy
4. Everything should work! 🎉

---

## Troubleshooting

### Error: "Project not found"
- Update `.firebaserc` with correct project ID
- Or run `firebase use --add` to select project

### Error: "Functions build failed"
- Check `functions/package.json` has all dependencies
- Run `cd functions && npm install` again

### Error: "Cannot find module '../backend/...'"
- Functions needs access to backend files
- Make sure backend folder is at same level as functions
- Or update import paths

### CORS Errors:
- Already configured in `functions/index.js`
- Should work automatically with Firebase Hosting

---

## Environment Variables

If you need Cloudinary or other env vars:

```bash
firebase functions:config:set cloudinary.cloud_name="your-name"
firebase functions:config:set cloudinary.api_key="your-key"
firebase functions:config:set cloudinary.api_secret="your-secret"
```

Access in code:
```javascript
const config = functions.config();
const cloudName = config.cloudinary.cloud_name;
```

---

## Quick Deploy Command

```bash
# Build + Deploy in one go
cd frontend && npm run build && cd .. && firebase deploy
```

---

## Free Tier Limits

- **Hosting:** 10GB storage, 360MB/day transfer
- **Functions:** 2M invocations/month, 400K GB-seconds
- **Firestore:** 50K reads/day, 20K writes/day

**Total Cost:** $0 for development/small apps! 🎉

---

**Ready to deploy! Follow the steps above. 🚀**



