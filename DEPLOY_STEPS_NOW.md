# 🚀 Deploy Your App - Step by Step

## ✅ Already Done:
- ✅ Firebase CLI installed
- ✅ Functions dependencies installed
- ✅ Frontend built (`frontend/dist` exists)
- ✅ Project ID set: `academyproject-9c6d3`

## 📋 What You Need To Do:

### Step 1: Login to Firebase (Required - Opens Browser)
```bash
firebase login
```
This will open your browser - sign in with your Google account.

### Step 2: Verify Project
```bash
firebase use academyproject-9c6d3
```

### Step 3: Deploy Everything
```bash
firebase deploy
```

Or deploy separately:
```bash
firebase deploy --only hosting
firebase deploy --only functions
```

---

## After Deployment:

✅ **Your App Will Be Live At:**
- Frontend: `https://academyproject-9c6d3.web.app`
- Backend API: `https://academyproject-9c6d3.web.app/api/*`

---

## Troubleshooting:

### If "Not logged in" error:
1. Run: `firebase login`
2. Complete browser authentication
3. Try deploy again

### If "Project not found" error:
1. Go to: https://console.firebase.google.com/
2. Make sure project `academyproject-9c6d3` exists
3. Check you have access to it

---

**Just 3 commands to deploy! 🎉**





