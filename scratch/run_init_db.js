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

  console.log('Connecting to Supabase...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Creating table damage_policies if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS damage_policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ damage_policies table created successfully!');

    // Seed default policies
    console.log('Seeding default policies...');
    const defaultPolicies = [
      { name: 'Broken Pole', price: 50.00, image: '' },
      { name: 'Strung Reel', price: 50.00, image: '' },
      { name: 'Broken Eye', price: 50.00, image: '' },
      { name: 'Broken Tacklebox shell', price: 25.00, image: '' },
      { name: 'Lost rigging Pliers', price: 10.00, image: '' },
      { name: 'Late Return (Over 1 Hour past window)', price: 100.00, image: '' }
    ];

    for (const p of defaultPolicies) {
      await pool.query(
        `INSERT INTO damage_policies (name, price, image_url) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO NOTHING;`,
        [p.name, p.price, p.image]
      );
    }
    console.log('✅ Default policies seeded!');

    await pool.end();
    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
}

run();
