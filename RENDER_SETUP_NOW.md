# 🚨 URGENT: Add Environment Variables in Render

Your backend is failing because **Firebase environment variables are missing** in Render.

## ⚡ Quick Fix - 5 Minutes

### Step 1: Go to Render Dashboard
1. Go to [render.com](https://render.com/dashboard)
2. Click on your backend service (the one that's failing)

### Step 2: Add Environment Variables
1. Click **"Environment"** tab
2. Click **"Add Environment Variable"** for each of these:

#### Required Firebase Variables:

```
Key: FIREBASE_PROJECT_ID
Value: your-firebase-project-id
```

```
Key: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

```
Key: FIREBASE_PRIVATE_KEY
Value: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

### Step 3: Get Firebase Credentials

1. **Go to Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project
3. Click the **⚙️ Settings icon** → **Project Settings**
4. Go to **"Service Accounts"** tab
5. Click **"Generate New Private Key"**
6. A JSON file will download

7. **Open the JSON file** and copy:
   - `project_id` → Use for `FIREBASE_PROJECT_ID`
   - `client_email` → Use for `FIREBASE_CLIENT_EMAIL`
   - `private_key` → Use for `FIREBASE_PRIVATE_KEY`

   **For FIREBASE_PRIVATE_KEY**: 
   - Copy the ENTIRE private key including:
     `-----BEGIN PRIVATE KEY-----`
     and 
     `-----END PRIVATE KEY-----`
   - Keep it as one long string with `\n` for newlines
   - Or paste it with actual line breaks (Render will handle it)

### Step 4: Add Other Required Variables

```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 5000
```

```
Key: FRONTEND_URL
Value: https://your-vercel-url.vercel.app
(Or use a placeholder for now, update later)
```

```
Key: CLOUDINARY_CLOUD_NAME
Value: your-cloudinary-cloud-name
```

```
Key: CLOUDINARY_API_KEY
Value: your-cloudinary-api-key
```

```
Key: CLOUDINARY_API_SECRET
Value: your-cloudinary-api-secret
```

### Step 5: Save and Wait
1. Click **"Save Changes"** after adding all variables
2. Render will automatically restart your service
3. Wait 1-2 minutes for restart
4. Check the logs - should see "✅ Using Firebase credentials from environment variables"

---

## ✅ Success Indicators

After saving, you should see in logs:
```
✅ Using Firebase credentials from environment variables
   Project ID: your-project-id
✅ Firebase Admin initialized successfully
🚀 Server running on port 5000
```

---

## 🔍 Still Not Working?

1. **Check all variables are set** - Go back to Environment tab and verify
2. **Check for typos** - Variable names must match exactly (case-sensitive)
3. **Check FIREBASE_PRIVATE_KEY format** - Should include BEGIN and END lines
4. **Check logs** - Look for specific error messages

---

## 📝 Example FIREBASE_PRIVATE_KEY Format

In Render, paste it like this (with quotes):
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

Or paste the actual multi-line key (Render will handle it):
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...
-----END PRIVATE KEY-----
```

---

**After adding these variables and saving, your backend should start successfully!** 🚀


