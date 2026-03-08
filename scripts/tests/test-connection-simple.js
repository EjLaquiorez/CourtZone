const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'laro_dev',
    user: 'postgres',
    password: null,
  });

  try {
    console.log('🔍 Testing PostgreSQL connection...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT version()');
    console.log('✅ Query successful:', result.rows[0].version);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.end();
  }
}

testConnection();
