// Test authentication flow
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

async function testAuthFlow() {
  console.log('🧪 Testing LaroHub Authentication Flow...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123',
      position: 'PG',
      skillLevel: 7
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    const registerResult = await registerResponse.json();
    console.log('Register Response:', registerResult);

    if (registerResult.success) {
      console.log('✅ Registration successful');
      
      // Test 2: Login with the same user
      console.log('\n2. Testing user login...');
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123'
      };

      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const loginResult = await loginResponse.json();
      console.log('Login Response:', loginResult);

      if (loginResult.success && loginResult.data?.tokens?.accessToken) {
        console.log('✅ Login successful');
        
        // Test 3: Access protected route
        console.log('\n3. Testing protected route access...');
        const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.data.tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const meResult = await meResponse.json();
        console.log('Me Response:', meResult);

        if (meResult.success) {
          console.log('✅ Protected route access successful');
        } else {
          console.log('❌ Protected route access failed');
        }
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
      
      // If registration failed due to existing user, try login
      if (registerResult.message?.includes('already exists')) {
        console.log('\n2. User exists, testing login...');
        const loginData = {
          email: 'test@example.com',
          password: 'TestPassword123'
        };

        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        const loginResult = await loginResponse.json();
        console.log('Login Response:', loginResult);

        if (loginResult.success) {
          console.log('✅ Login successful');
        } else {
          console.log('❌ Login failed');
        }
      }
    }

    // Test 4: Test public routes
    console.log('\n4. Testing public routes...');
    const homeResponse = await fetch(`${BASE_URL}/`);
    if (homeResponse.ok) {
      console.log('✅ Home page accessible');
    } else {
      console.log('❌ Home page not accessible');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuthFlow();
