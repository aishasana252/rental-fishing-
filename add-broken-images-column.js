const { query } = require('./src/lib/db');

async function migrate() {
  try {
    console.log('Adding broken_images column to damage_policies...');
    await query(`
      ALTER TABLE damage_policies
      ADD COLUMN IF NOT EXISTS broken_images JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
