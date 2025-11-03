// Test Firebase via API endpoint
import http from 'http';

const PORT = process.env.PORT || 5000;

console.log('🧪 Testing Firebase connection via API...\n');

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/firebase-test/connection',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log('✅ Firebase connection test PASSED!');
        console.log(`   Message: ${result.message}`);
        console.log(`\n📋 Next steps:`);
        console.log(`   1. Test create document: POST http://localhost:${PORT}/api/firebase-test/create-test`);
        console.log(`   2. Test Academy model: POST http://localhost:${PORT}/api/firebase-test/test-academy`);
        console.log(`   3. View all tests: http://localhost:${PORT}/api/firebase-test/compare`);
      } else {
        console.log('❌ Firebase connection test FAILED!');
        console.log(`   Error: ${result.message}`);
      }
    } catch (error) {
      console.log('⚠️  Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log(`❌ Error: ${error.message}`);
  console.log('   Make sure server is running: npm run dev');
  process.exit(1);
});

req.end();


