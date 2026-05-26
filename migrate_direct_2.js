const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: "postgresql://postgres.xfmxvxnfsuojdprhhcoq:Reelfishingcompany2%23@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    await client.query('ALTER TABLE bookings DROP COLUMN IF EXISTS security_deposit;');
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_added DECIMAL(10, 2) DEFAULT 0.00;');
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deducted DECIMAL(10, 2) DEFAULT 0.00;');
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_released DECIMAL(10, 2) DEFAULT 0.00;');
    
    console.log('Columns security_added, security_deducted, security_released added to bookings table.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
