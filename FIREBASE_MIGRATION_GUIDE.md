# Firebase Migration Guide

## Overview
This guide explains how to migrate from MongoDB to Firebase Firestore while keeping your Express backend.

## Step 1: Install Firebase SDK

```bash
cd backend
npm install firebase-admin
```

## Step 2: Initialize Firebase

Create `backend/config/firebase.js`:
```javascript
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export default admin;
```

## Step 3: Update Models

Replace Mongoose models with Firestore collections:

### Example: Academy Model

**Old (MongoDB/Mongoose):**
```javascript
import mongoose from "mongoose";
const academySchema = new mongoose.Schema({...});
export default mongoose.model("Academy", academySchema);
```

**New (Firestore):**
```javascript
import { db } from "../config/firebase.js";

export const createAcademy = async (data) => {
  const docRef = await db.collection('academies').add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return docRef;
};

export const getAcademyById = async (id) => {
  const doc = await db.collection('academies').doc(id).get();
  return { id: doc.id, ...doc.data() };
};

export const getAllAcademies = async () => {
  const snapshot = await db.collection('academies').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Step 4: Update Controllers

Replace Mongoose queries with Firestore operations:

**Example:**
```javascript
import { createAcademy, getAcademyById } from '../models/Academy.js';

export const createAcademyController = async (req, res) => {
  try {
    const academyData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      createdBy: req.body.createdBy,
      logo: req.files?.logo?.[0]?.path || "",
      banner: req.files?.banner?.[0]?.path || "",
    };
    
    const docRef = await createAcademy(academyData);
    const academy = await getAcademyById(docRef.id);
    
    res.status(201).json({
      success: true,
      message: "Academy created successfully!",
      data: academy,
    });
  } catch (err) {
    console.error("Error creating academy:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while creating academy.",
    });
  }
};
```

## Step 5: Key Differences

### Queries

**MongoDB:**
```javascript
Academy.find().populate("createdBy", "name email")
Academy.findById(id)
Academy.findOne({ email: email })
```

**Firestore:**
```javascript
db.collection('academies').get()
db.collection('academies').doc(id).get()
db.collection('academies').where('email', '==', email).get()
```

### Relationships (Populate)

Firestore doesn't have populate. You need to fetch related data manually:
```javascript
const academy = await db.collection('academies').doc(id).get();
const creator = await db.collection('users').doc(academy.data().createdBy).get();
```

## Step 6: Authentication (Optional - Use Firebase Auth)

Replace custom auth with Firebase Auth:

```javascript
import admin from 'firebase-admin';

// Verify Firebase ID token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
```

## Step 7: File Storage (Optional - Use Firebase Storage)

Replace Cloudinary with Firebase Storage:

```javascript
import admin from 'firebase-admin';

const bucket = admin.storage().bucket();

export const uploadFile = async (file, path) => {
  const fileUpload = bucket.file(path);
  await fileUpload.save(file.buffer);
  const url = await fileUpload.getSignedUrl({ action: 'read', expires: '03-01-2500' });
  return url[0];
};
```

## Migration Checklist

- [ ] Install firebase-admin
- [ ] Create Firebase project and get service account key
- [ ] Replace database connection (db.js)
- [ ] Migrate all models (Academy, User, Post, Comment)
- [ ] Update all controllers
- [ ] Update all routes/queries
- [ ] Test all API endpoints
- [ ] Migrate existing data (if needed)
- [ ] Update frontend API calls (if structure changes)

## Notes

- Firestore uses document IDs instead of ObjectId
- No automatic relationships (need manual joins)
- Queries are different but similar concepts
- Timestamps handled differently
- Consider using Firebase SDK on frontend for real-time updates






