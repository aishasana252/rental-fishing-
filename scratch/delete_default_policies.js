const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function run() {
  // Load .env
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found');
    return;
  }
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  const dbUrl = match ? match[1] : null;

  if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env');
    return;
  }

  console.log('Connecting to Supabase to remove default policies...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const defaultNames = [
      'Broken Pole',
      'Strung Reel',
      'Broken Eye',
      'Broken Tacklebox shell',
      'Lost rigging Pliers',
      'Late Return (Over 1 Hour past window)'
    ];

    console.log('Deleting default pre-seeded policies from Supabase...');
    const res = await pool.query(
      `DELETE FROM damage_policies WHERE name = ANY($1) RETURNING *;`,
      [defaultNames]
    );
    console.log(`✅ Deleted ${res.rowCount} default policies!`);

    await pool.end();
    console.log('🎉 Supabase cleanup complete!');
  } catch (err) {
    console.error('❌ Deletion failed:', err);
  }

  // Also clean up db_mock.json
  const mockPath = path.join(__dirname, '../db_mock.json');
  if (fs.existsSync(mockPath)) {
    try {
      const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
      if (mockData.damage_policies) {
        const originalCount = mockData.damage_policies.length;
        mockData.damage_policies = mockData.damage_policies.filter(
          p => !['Broken Pole', 'Strung Reel', 'Broken Eye', 'Broken Tacklebox shell', 'Lost rigging Pliers', 'Late Return (Over 1 Hour past window)'].includes(p.name)
        );
        fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2), 'utf-8');
        console.log(`✅ Cleaned up db_mock.json! Removed ${originalCount - mockData.damage_policies.length} items.`);
      }
    } catch (e) {
      console.error('Failed to clean mock DB:', e);
    }
  }
}

run();
