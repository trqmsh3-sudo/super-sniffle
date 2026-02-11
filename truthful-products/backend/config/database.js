const { Pool } = require('pg');

// PostgreSQL connection
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      // Render/managed Postgres requires SSL in production
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'clearpick',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Quick fail if DB not available
  query_timeout: 30000,
  statement_timeout: 30000,
  allowExitOnIdle: true, // Allow process to exit when idle
});

// Test connection
pool.on('connect', () => {
  console.log('🔌 Connected to PostgreSQL database');
});

// Gracefully handle connection failures
pool.on('error', (err, client) => {
  console.error('⚠️  PostgreSQL connection error:', err.message);
  // Don't crash - allow app to continue in degraded mode
});

// Wrap query to handle errors gracefully
const safeQuery = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    // Log error but don't crash - allow degraded mode
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn('⚠️  Database connection unavailable:', error.message);
    }
    throw error; // Re-throw so routes can handle it
  }
};

module.exports = {
  query: safeQuery,
  pool
};
