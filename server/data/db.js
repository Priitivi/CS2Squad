require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // 🔑 required by Render
});


pool.query('SELECT NOW()')
  .then(res => console.log('✅ Connected to Postgres at', res.rows[0].now))
  .catch(err => console.error('❌ Connection error:', err));

module.exports = pool;
