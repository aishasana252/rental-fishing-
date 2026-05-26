const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: "postgresql://postgres.xfmxvxnfsuojdprhhcoq:Reelfishingcompany2%23@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10, 2) DEFAULT 0.00;');
    console.log('Column security_deposit added to bookings table.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
