// Final comprehensive verification test
const fetch = require('node-fetch');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3003';
const SOCKET_URL = 'http://localhost:3003';

async function runFinalVerification() {
  console.log('🏀 LaroHub Final Verification Test');
  console.log('=====================================\n');

  let allTestsPassed = true;
  const results = {
    frontend: false,
    backend: false,
    auth: false,
    database: false,
    socket: false,
    integration: false
  };

  try {
    // Test 1: Frontend Pages
    console.log('1. Testing Frontend Pages...');
    const pages = ['/', '/login', '/register', '/demo', '/features'];
    let frontendPassed = true;
    
    for (const page of pages) {
      const response = await fetch(`${BASE_URL}${page}`);
      if (!response.ok) {
        console.log(`   ❌ ${page} failed (${response.status})`);
        frontendPassed = false;
      } else {
        console.log(`   ✅ ${page} working`);
      }
    }
    results.frontend = frontendPassed;

    // Test 2: Backend API
    console.log('\n2. Testing Backend API...');
    const timestamp = Date.now();
    const testUser = {
      email: `final${timestamp}@test.com`,
      username: `final${timestamp.toString().slice(-6)}`,
      password: 'TestPass123',
      position: 'PG',
      skillLevel: 8
    };

    // Registration
    const regResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regResult = await regResponse.json();
    
    if (regResult.success) {
      console.log('   ✅ User registration working');
      results.backend = true;
      
      // Login
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      const loginResult = await loginResponse.json();
      
      if (loginResult.success && loginResult.data?.tokens?.accessToken) {
        console.log('   ✅ User login working');
        results.auth = true;
        
        const token = loginResult.data.tokens.accessToken;
        
        // Protected route
        const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meResult = await meResponse.json();
        
        if (meResult.success) {
          console.log('   ✅ Protected routes working');
          console.log(`   ✅ User profile: ${meResult.data.username} (${meResult.data.email})`);
          results.database = true;
          results.integration = true;
        }
      }
    }

    // Test 3: Socket.IO
    console.log('\n3. Testing Socket.IO...');
    await new Promise((resolve, reject) => {
      const socket = io(SOCKET_URL, { timeout: 5000 });
      let socketPassed = false;
      
      const timeout = setTimeout(() => {
        if (!socketPassed) {
          console.log('   ❌ Socket connection timeout');
          socket.disconnect();
          resolve();
        }
      }, 8000);
      
      socket.on('connect', () => {
        console.log('   ✅ Socket connected');
        socketPassed = true;
        results.socket = true;
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      });
      
      socket.on('connect_error', (error) => {
        console.log('   ❌ Socket connection failed:', error.message);
        clearTimeout(timeout);
        resolve();
      });
    });

    // Test 4: Dashboard Access
    console.log('\n4. Testing Dashboard Access...');
    const dashResponse = await fetch(`${BASE_URL}/dashboard`);
    if (dashResponse.ok) {
      console.log('   ✅ Dashboard accessible');
    } else {
      console.log('   ⚠️  Dashboard redirect (expected for unauthenticated)');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    allTestsPassed = false;
  }

  // Final Results
  console.log('\n🎯 FINAL VERIFICATION RESULTS');
  console.log('==============================');
  console.log(`Frontend Pages:     ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend API:        ${results.backend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication:     ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database:           ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Socket.IO:          ${results.socket ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Integration:        ${results.integration ? '✅ PASS' : '❌ FAIL'}`);

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall Score: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! LaroHub is fully functional! 🏀');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

runFinalVerification();
