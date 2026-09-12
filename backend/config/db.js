const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Determine if SSL is required (TiDB Cloud, port 4000, or DB_SSL=true)
const isSSL = process.env.DB_SSL === 'true' || 
              (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com')) ||
              (process.env.DB_PORT && parseInt(process.env.DB_PORT, 10) === 4000);

// Database configuration with environment variable and TiDB Cloud support
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

if (isSSL) {
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
}

// Create a connection pool using mysql2/promise
const pool = mysql.createPool(dbConfig);

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
