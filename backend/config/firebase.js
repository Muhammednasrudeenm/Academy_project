import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key - supports both env vars (for Render) and file (for local)
let serviceAccount;

// Check if environment variables are set (for Render/production)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  // Use environment variables (for Render/production)
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  console.log('✅ Using Firebase credentials from environment variables');
} else {
  // Fallback to service account file (for local development)
  try {
    const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
    const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountData);
    console.log('✅ Using Firebase credentials from serviceAccountKey.json');
  } catch (error) {
    console.error('❌ Error loading Firebase service account:', error.message);
    console.error('⚠️  Make sure serviceAccountKey.json exists in backend/config/');
    console.error('   Or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars');
    process.exit(1);
  }
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
}

// Export Firestore database instance
export const db = admin.firestore();
export default admin;


