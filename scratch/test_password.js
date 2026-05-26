const { Client } = require('pg');

async function run() {
  // Use unencoded password: Reelfishingcompany2#
  // We will pass client config object instead of a connection string, which avoids URL-parsing issues!
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.xfmxvxnfsuojdprhhcoq',
    password: 'Reelfishingcompany2#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  console.log('Testing connection to pooler with unencoded password...');
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connected to Supabase Pooler!');
    const res = await client.query('SELECT COUNT(*) FROM users;');
    console.log('📊 Users count:', res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

run();
