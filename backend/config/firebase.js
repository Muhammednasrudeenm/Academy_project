import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key - supports both env vars (for Render) and file (for local)
let serviceAccount;

// Check if we're in production (Render) - check for environment variables first
const hasEnvVars = process.env.FIREBASE_PROJECT_ID && 
                   process.env.FIREBASE_CLIENT_EMAIL && 
                   process.env.FIREBASE_PRIVATE_KEY;

if (hasEnvVars) {
  // Use environment variables (for Render/production)
  try {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    console.log('✅ Using Firebase credentials from environment variables');
    console.log(`   Project ID: ${serviceAccount.projectId}`);
  } catch (error) {
    console.error('❌ Error parsing Firebase environment variables:', error.message);
    process.exit(1);
  }
} else {
  // Fallback to service account file (for local development)
  try {
    const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
    const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountData);
    console.log('✅ Using Firebase credentials from serviceAccountKey.json');
  } catch (error) {
    console.error('❌ Error loading Firebase service account:', error.message);
    console.error('');
    console.error('⚠️  FIREBASE CONFIGURATION MISSING!');
    console.error('');
    console.error('For local development:');
    console.error('   Make sure serviceAccountKey.json exists in backend/config/');
    console.error('');
    console.error('For production (Render):');
    console.error('   Set these environment variables in Render dashboard:');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('');
    console.error('   See ENVIRONMENT_VARIABLES.md for details');
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


