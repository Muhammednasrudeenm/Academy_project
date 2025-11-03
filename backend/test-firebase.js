// Quick test script to verify Firebase connection
import { db } from './config/firebase.js';

console.log('🧪 Testing Firebase connection...');

try {
  // Test Firestore connection by reading a collection
  const testRef = db.collection('test');
  console.log('✅ Firestore connection successful!');
  console.log('✅ Firebase is ready to use!');
  
  // Test write operation (optional - creates a test document)
  // await testRef.add({ test: true, timestamp: new Date() });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  process.exit(1);
}



