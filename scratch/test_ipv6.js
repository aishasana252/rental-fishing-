const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '2406:da18:1f7e:b102:f93b:fcd9:47cc:e58',
    port: 5432,
    user: 'postgres',
    password: 'Reelfishingcompany2#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  console.log('Testing direct IPv6 connection to database...');
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connected to Supabase via direct IPv6!');
    const res = await client.query('SELECT COUNT(*) FROM users;');
    console.log('📊 Users count:', res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

run();
