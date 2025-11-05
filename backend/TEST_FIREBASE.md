# 🧪 Firebase Testing Guide

## Quick Test (Terminal)

```bash
cd backend
node test-firebase.js
```

**Expected Output:**
```
✅ Firestore connection successful!
✅ Firebase is ready to use!
```

---

## API Endpoint Tests

Once your server is running, test these endpoints:

### 1. Test Connection ✅
```bash
GET http://localhost:5000/api/firebase-test/connection
```
**Expected:** `{"success": true, "message": "✅ Firebase connection successful!"}`

### 2. Create Test Document ✅
```bash
POST http://localhost:5000/api/firebase-test/create-test
```
**Expected:** Creates a test document in Firestore

### 3. Read Test Documents ✅
```bash
GET http://localhost:5000/api/firebase-test/read-test
```
**Expected:** Returns all test documents

### 4. Test Academy Model ✅
```bash
POST http://localhost:5000/api/firebase-test/test-academy
```
**Expected:** Creates a test academy using Firestore

### 5. Get All Academies (Firestore) ✅
```bash
GET http://localhost:5000/api/firebase-test/test-academies
```
**Expected:** Returns academies from Firestore

### 6. Compare MongoDB vs Firestore ✅
```bash
GET http://localhost:5000/api/firebase-test/compare
```
**Expected:** Shows comparison between MongoDB and Firestore

---

## Using Postman or Browser

1. **Start your server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test in browser:**
   - Open: http://localhost:5000/api/firebase-test/connection
   - Should see: `{"success": true, ...}`

3. **Test with curl (if you have it):**
   ```bash
   curl http://localhost:5000/api/firebase-test/connection
   ```

---

## Using Frontend (React)

```javascript
// Test Firebase connection
const testFirebase = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/firebase-test/connection');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## What Each Test Does

| Test | Purpose | What It Checks |
|------|---------|----------------|
| `/connection` | Basic connection | Firebase Admin SDK initialized |
| `/create-test` | Write operation | Can create documents in Firestore |
| `/read-test` | Read operation | Can read documents from Firestore |
| `/test-academy` | Model test | Academy Firestore model works |
| `/test-academies` | Query test | Can query and retrieve academies |
| `/compare` | Comparison | Both MongoDB and Firestore running |

---

## Success Indicators

✅ **All tests passing means:**
- Firebase is properly configured
- Service account key is valid
- Firestore database is accessible
- Models are working correctly
- Ready for full migration!

❌ **If tests fail:**
- Check `serviceAccountKey.json` exists
- Verify Firestore is enabled in Firebase Console
- Check error messages in terminal
- Make sure Firebase project is active

---

## Next Steps After Tests Pass

Once all tests pass:
1. ✅ Firebase is ready!
2. Migrate remaining models (Post, Comment)
3. Update routes to use Firestore
4. Switch from MongoDB to Firestore

---

## Troubleshooting

**Error: "serviceAccountKey.json not found"**
- Make sure file is in `backend/config/serviceAccountKey.json`

**Error: "Permission denied"**
- Check Firestore rules in Firebase Console
- Should be in "test mode" for development

**Error: "Port already in use"**
- Change PORT in `.env` to 5001 or another port
- Or kill the process using port 5000






