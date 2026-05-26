const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const mockDbPath = path.join(__dirname, '../db_mock.json');
  if (!fs.existsSync(mockDbPath)) {
    console.error('❌ db_mock.json not found!');
    return;
  }

  // Load mock database
  const mockData = JSON.parse(fs.readFileSync(mockDbPath, 'utf-8'));
  const localUsers = mockData.users || [];
  
  // Filter out the default admin user (since it is already in Supabase)
  const usersToSync = localUsers.filter(u => u.email !== 'admin@reelproblems.com');

  if (usersToSync.length === 0) {
    console.log('✅ No local users need to be synced!');
    return;
  }

  console.log(`Found ${usersToSync.length} users to sync:`, usersToSync.map(u => u.email));

  // Parse .env manually to avoid extra dependencies
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  const dbUrl = match ? match[1] : null;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set or couldn\'t be read in your .env file!');
    return;
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase!');

    for (const user of usersToSync) {
      console.log(`Syncing user: ${user.email} (${user.full_name})...`);
      
      // Check if user already exists in Supabase
      const checkRes = await client.query('SELECT id FROM users WHERE email = $1;', [user.email]);
      if (checkRes.rows.length > 0) {
        console.log(`⚠️ User ${user.email} already exists in Supabase. Skipping.`);
        continue;
      }

      // Insert user
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [user.id, user.email, user.password_hash, user.full_name, user.phone, user.role, user.created_at]
      );
      console.log(`🎉 Successfully synced user ${user.email}!`);
    }

    await client.end();
    console.log('\n🌟 Database Sync Completed Successfully!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    console.log('\n💡 Please check if your DATABASE_URL in .env is updated to the IPv4 Pooler URL.');
  }
}

run();
