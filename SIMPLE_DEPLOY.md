# ⚡ Simple Deployment - Just Follow These Steps

## ✅ Option 1: Firebase (Easiest - 3 Commands)

### Open PowerShell/Terminal in: `Academy_project-dev`

```bash
# Step 1: Login (will open browser)
firebase login

# Step 2: Initialize (answer prompts - see below)
firebase init

# Step 3: Deploy
firebase deploy
```

### During `firebase init`, answer:
1. **Select features:** Space on **Hosting** and **Functions**, then Enter
2. **Project:** Select **Use existing project** → Choose `academyproject-9c6d3`
3. **Hosting directory:** Type `frontend/dist` and Enter
4. **Single-page app:** Type `y` and Enter
5. **Auto-deploy:** Type `n` and Enter
6. **Functions language:** Arrow to **JavaScript**, Enter
7. **ESLint:** Type `n` and Enter
8. **Install dependencies:** Type `y` and Enter

**Wait for it to finish...**

### After `firebase deploy`:
Your app will be live at: **`https://academyproject-9c6d3.web.app`** 🎉

---

## ✅ Option 2: Vercel + Render (If Firebase doesn't work)

### Frontend → Vercel (5 min)

1. **Push to GitHub:**
   - Create repo on GitHub
   - Push your `frontend` folder code

2. **Deploy:**
   - Go to: https://vercel.com
   - Import GitHub repo
   - Settings:
     - Framework: **Vite**
     - Root: `frontend`
     - Build: `npm run build`
   - Deploy

### Backend → Render (10 min)

1. **Push to GitHub:**
   - Push your `backend` folder code

2. **Deploy:**
   - Go to: https://render.com
   - New Web Service
   - Connect GitHub
   - Settings:
     - Build: `npm install`
     - Start: `npm start`
   - Add environment variables
   - Deploy

3. **Update Frontend:**
   - Add environment variable in Vercel: `VITE_API_URL` = your Render URL
   - Redeploy

---

## 🎯 Recommended: Start with Firebase

It's the easiest because everything is already set up! Just run:
```bash
firebase login
firebase init
firebase deploy
```

**That's it!** 🚀

---

## Troubleshooting

### "firebase: command not found"
```bash
npm install -g firebase-tools
```

### "Not logged in"
```bash
firebase login
```

### "Project not found"
- Make sure you're logged in with correct Google account
- Check Firebase Console: https://console.firebase.google.com/

---

**Choose one option and follow the steps! I recommend Firebase. 🎉**

