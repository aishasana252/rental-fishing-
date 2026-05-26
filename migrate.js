import { query } from './src/lib/db.js';

async function runMigration() {
  try {
    console.log('Adding security_deposit to bookings table...');
    await query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10, 2) DEFAULT 0.00;');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
