const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AAA Tech Solutions Backend Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  const dbType = process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com') ? 'TiDB Cloud' : 'MySQL';
  console.log(`🗄️ Database: ${dbType} (${process.env.DB_NAME || 'aaa_tech_solutions'})`);
  console.log(`======================================================\n`);
});