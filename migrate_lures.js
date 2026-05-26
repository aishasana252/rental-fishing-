const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: "postgresql://postgres.xfmxvxnfsuojdprhhcoq:Reelfishingcompany2%23@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    // Add new columns
    await client.query('ALTER TABLE lures ADD COLUMN IF NOT EXISTS total_qty INT DEFAULT 0;');
    await client.query('ALTER TABLE lures ADD COLUMN IF NOT EXISTS damaged_qty INT DEFAULT 0;');
    await client.query('ALTER TABLE lures ADD COLUMN IF NOT EXISTS missing_qty INT DEFAULT 0;');
    
    // Set total_qty to current stock_qty where total_qty is 0
    await client.query('UPDATE lures SET total_qty = stock_qty WHERE total_qty = 0;');

    console.log('Columns total_qty, damaged_qty, missing_qty added to lures table.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
