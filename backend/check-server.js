// Quick script to check server status
import http from 'http';

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

console.log(`🔍 Checking if server is running on ${HOST}:${PORT}...\n`);

const options = {
  hostname: HOST,
  port: PORT,
  path: '/',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Server IS RUNNING!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Response: ${data}`);
    console.log(`\n📋 Test these endpoints:`);
    console.log(`   - http://${HOST}:${PORT}/api/debug`);
    console.log(`   - http://${HOST}:${PORT}/api/firebase-test/connection`);
    process.exit(0);
  });
});

req.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.log(`❌ Server is NOT running on port ${PORT}`);
    console.log(`\n💡 To start the server, run:`);
    console.log(`   cd backend`);
    console.log(`   npm run dev`);
    console.log(`\n   OR`);
    console.log(`   npm start`);
  } else if (error.code === 'ETIMEDOUT') {
    console.log(`⏱️  Server might be starting... (timeout)`);
    console.log(`   Try again in a few seconds`);
  } else {
    console.log(`❌ Error checking server: ${error.message}`);
  }
  process.exit(1);
});

req.on('timeout', () => {
  console.log(`⏱️  Request timeout - server might be slow or not responding`);
  req.destroy();
  process.exit(1);
});

req.end();



