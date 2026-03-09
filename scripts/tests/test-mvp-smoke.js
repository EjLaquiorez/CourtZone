const fetch = require('node-fetch');

const BASE_URL = process.env.COURTZONE_BASE_URL || 'http://localhost:3000';
const UNIQUE_SUFFIX = Date.now();
const EMAIL = `smoke-${UNIQUE_SUFFIX}@example.com`;
const USERNAME = `smoke_${UNIQUE_SUFFIX}`;
const PASSWORD = 'SmokeTest123';

async function parseJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const json = await parseJson(response);

  if (!response.ok) {
    throw new Error(json?.message || `Request failed: ${path}`);
  }

  return json;
}

async function run() {
  console.log(`Running Court Zone MVP smoke test against ${BASE_URL}\n`);

  console.log('1. Register user');
  const registerResult = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: EMAIL,
      username: USERNAME,
      password: PASSWORD,
      position: 'PG',
      skillLevel: 6,
      city: 'Los Angeles',
    }),
  });
  const token = registerResult?.data?.tokens?.accessToken;
  if (!token) {
    throw new Error('Registration did not return an access token');
  }

  console.log('2. Complete profile');
  await request('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      city: 'Los Angeles',
      maxDistance: 15,
      position: 'PG',
      skillLevel: 6,
    }),
  });

  console.log('3. Read games list');
  const gamesResult = await request('/api/games', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('4. Read teams list');
  await request('/api/teams', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('5. Read courts list');
  const courtsResult = await request('/api/courts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const firstCourt = courtsResult?.data?.data?.[0];
  if (!firstCourt) {
    console.log('No court available to create a game against, stopping after list verification.');
    console.log('\nSmoke test passed for auth/profile/list flows.');
    return;
  }

  console.log('6. Create scheduled game');
  const gameResult = await request('/api/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Smoke Test Pickup',
      description: 'Automated MVP smoke test game',
      courtId: firstCourt.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      maxPlayers: 10,
      skillLevel: { min: 3, max: 8 },
      gameType: 'pickup',
      isPrivate: false,
    }),
  });

  console.log('7. Fetch created game detail');
  await request(`/api/games/${gameResult.data.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('\nSmoke test passed.');
  console.log(`Registered user: ${EMAIL}`);
  console.log(`Games returned: ${gamesResult?.data?.data?.length ?? 0}`);
}

run().catch((error) => {
  console.error('\nSmoke test failed:', error.message);
  process.exitCode = 1;
});
