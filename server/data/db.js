// server/data/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cs2squad', // ✅ MUST match the database you ran schema.sql into
  password: 'mypassword123',
  port: 5432,
});

pool.query('SELECT NOW()')
  .then(res => console.log('✅ Connected to Postgres at', res.rows[0].now))
  .catch(err => console.error('❌ Connection error:', err));

module.exports = pool;
