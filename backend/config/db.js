const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Determine if SSL/TLS is required (TiDB Cloud, port 4000, or DB_SSL=true)
const isSSL = process.env.DB_SSL === 'true' || 
              (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com')) ||
              (process.env.DB_PORT && parseInt(process.env.DB_PORT, 10) === 4000) ||
              Boolean(process.env.DB_SSL_CA);

/**
 * Build SSL configuration for secure MySQL / TiDB Cloud TLS connections
 * TiDB Cloud strictly requires secure TLS 1.2+ connections.
 */
function getSslConfig() {
  if (!isSSL) return undefined;

  const sslConfig = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  // Optional custom CA certificate support (file path or certificate string)
  if (process.env.DB_SSL_CA) {
    const fs = require('fs');
    try {
      if (fs.existsSync(process.env.DB_SSL_CA)) {
        sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA);
      } else {
        sslConfig.ca = process.env.DB_SSL_CA;
      }
    } catch (err) {
      console.warn('⚠️ Could not load custom DB_SSL_CA certificate:', err.message);
    }
  }

  return sslConfig;
}

// Database configuration with environment variable and TiDB Cloud SSL support
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aaa_tech_solutions',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const sslConfig = getSslConfig();
if (sslConfig) {
  dbConfig.ssl = sslConfig;
}

// Support DATABASE_URL if explicitly provided, else use structured dbConfig
const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool(dbConfig);

// Safe connection verification
pool.getConnection()
  .then((conn) => {
    const sslInfo = isSSL ? ' (SSL/TLS Enabled)' : '';
    console.log(`✅ Database Connected Successfully: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}${sslInfo}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`❌ Database Connection Failed [${dbConfig.database}@${dbConfig.host}]:`, err.message);
  });

module.exports = pool;
