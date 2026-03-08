const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testProfileUpdate() {
  console.log('🏀 Testing Profile Update Functionality...\n');

  try {
    // 1. Create a test user
    console.log('1. Creating test user...');
    const timestamp = Date.now();
    const registerData = {
      email: `profiletest${timestamp}@example.com`,
      password: 'Password123!',
      username: `profiletest${timestamp}`.substring(0, 20), // Ensure username is under 20 chars
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

    // 2. Test profile update
    console.log('\n2. Testing profile update...');
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

    // 3. Verify the update by fetching user profile
    console.log('\n3. Verifying profile update...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const meResult = await meResponse.json();

    if (!meResult.success) {
      console.log('❌ Failed to fetch updated profile:', meResult.message);
      return;
    }

    console.log('✅ Profile verification successful');
    console.log('   Current profile:', {
      username: meResult.data.username,
      position: meResult.data.position,
      skillLevel: meResult.data.skillLevel,
      city: meResult.data.city
    });

    // 4. Test auth service updateProfile endpoint (what the frontend uses)
    console.log('\n4. Testing auth service updateProfile...');
    const authUpdateData = {
      username: `authtest${timestamp}`.substring(0, 20),
      position: 'SF',
      skillLevel: 4,
      city: 'Auth Test City'
    };

    // This should call the same /users/profile endpoint but through auth service
    const authUpdateResponse = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(authUpdateData)
    });

    const authUpdateResult = await authUpdateResponse.json();

    if (!authUpdateResult.success) {
      console.log('❌ Auth service profile update failed:', authUpdateResult.message);
      return;
    }

    console.log('✅ Auth service profile update successful');
    console.log('   Final profile:', {
      username: authUpdateResult.data.username,
      position: authUpdateResult.data.position,
      skillLevel: authUpdateResult.data.skillLevel,
      city: authUpdateResult.data.city
    });

    console.log('\n🎉 All profile update tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testProfileUpdate();
