const { Pool } = require("pg");
const fs = require("fs");

const isProduction = process.env.NODE_ENV === "production";

function getSslConfig() {
  if (!isProduction) return false;

  const caPath = process.env.PG_SSL_CA_PATH || "/app/rds-ca-bundle.pem";

  try {
    const ca = fs.readFileSync(caPath, "utf8");
    return {
      rejectUnauthorized: true,
      ca,
    };
  } catch (err) {
    // In production, fail fast rather than silently disabling verification
    console.error(`❌ Failed to read RDS CA bundle at ${caPath}`);
    console.error(err);
    throw err;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
});

pool.on("connect", () => {
  console.log("✅ Connected to Postgres");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error", err);
  process.exit(1);
});

module.exports = pool;
