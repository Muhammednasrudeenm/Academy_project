# 🚀 Deploy Now - Quick Steps

## Your app is NOT hosted yet. Follow these steps:

### Step 1: Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Get Your Project ID
From Firebase Console:
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Copy the **Project ID** (not Project Number)

### Step 4: Update .firebaserc
Edit `.firebaserc` and replace `your-project-id` with your actual Project ID.

### Step 5: Initialize Firebase (if not done)
```bash
cd Academy_project-dev
firebase init
```

Select:
- ✅ Hosting
- ✅ Functions

Settings:
- Project: Your project
- Hosting: `frontend/dist`
- Single-page: Yes
- Functions: JavaScript, `functions`

### Step 6: Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 7: Build Frontend
```bash
cd frontend
npm run build
cd ..
```

### Step 8: Deploy!
```bash
firebase deploy
```

Wait 5-10 minutes for first deployment.

---

## After Deployment, Your URLs Will Be:

- **Frontend:** `https://YOUR-PROJECT-ID.web.app`
- **API:** `https://YOUR-PROJECT-ID.web.app/api/*`

---

## Quick Check if Already Deployed

Run:
```bash
firebase hosting:sites:list
```

If you see your site, it's deployed!

---

**Need help with any step? Let me know!**


