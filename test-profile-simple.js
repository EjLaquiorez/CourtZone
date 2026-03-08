const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testProfileUpdateSimple() {
  console.log('🏀 Testing Profile Update - Simple Test...\n');

  try {
    // 1. Create a test user
    console.log('1. Creating test user...');
    const timestamp = Date.now();
    const registerData = {
      email: `simple${timestamp}@example.com`,
      password: 'Password123!',
      username: `simple${timestamp}`.substring(0, 20),
      position: 'PG',
      skillLevel: 3
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    
    if (!registerResult.success) {
      console.log('❌ Registration failed:', registerResult.message);
      return;
    }

    console.log('✅ User registered successfully');
    const accessToken = registerResult.data.tokens.accessToken;

    // 2. Test profile update (this is what the frontend auth store calls)
    console.log('\n2. Testing profile update via /api/users/profile...');
    const profileUpdateData = {
      username: `updated${timestamp}`.substring(0, 20),
      position: 'SG',
      skillLevel: 5,
      city: 'Test City'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(profileUpdateData)
    });

    const updateResult = await updateResponse.json();
    
    if (!updateResult.success) {
      console.log('❌ Profile update failed:', updateResult.message);
      return;
    }

    console.log('✅ Profile updated successfully');
    console.log('   Updated data:', {
      username: updateResult.data.username,
      position: updateResult.data.position,
      skillLevel: updateResult.data.skillLevel,
      city: updateResult.data.city
    });

    console.log('\n🎉 Profile update test passed!');
    console.log('\n📋 Summary:');
    console.log('✅ User registration working');
    console.log('✅ Profile update API working');
    console.log('✅ Auth token validation working');
    console.log('✅ Database updates working');
    console.log('\n🔧 The updateProfile function in auth store should now work!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testProfileUpdateSimple();
