const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to Postgres');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PG error', err);
  process.exit(1);
});

module.exports = pool;
