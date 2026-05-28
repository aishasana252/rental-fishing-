const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function alterDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL + '?sslmode=require' });
  try {
    console.log('Connecting to database...');
    const res = await pool.query('ALTER TABLE bookings ADD COLUMN guide_start_time VARCHAR(255);');
    console.log('Successfully added guide_start_time column.', res);
  } catch (error) {
    if (error.code === '42701') {
      console.log('Column guide_start_time already exists.');
    } else {
      console.error('Error altering database:', error);
    }
  } finally {
    await pool.end();
  }
}

alterDb();
