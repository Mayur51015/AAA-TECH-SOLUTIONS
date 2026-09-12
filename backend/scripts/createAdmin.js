const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function askQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('==================================================');
  console.log('       AAA Tech Solutions - Admin Account Setup    ');
  console.log('==================================================\n');

  const args = process.argv.slice(2);
  let username = '';
  let name = '';
  let email = '';
  let password = '';

  // Parse command line arguments if provided (--username admin --password secret)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) username = args[++i];
    if (args[i] === '--name' && args[i + 1]) name = args[++i];
    if (args[i] === '--email' && args[i + 1]) email = args[++i];
    if (args[i] === '--password' && args[i + 1]) password = args[++i];
  }

  // If not passed as CLI args, prompt interactively
  if (!username || !password) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (!username) {
      username = await askQuestion(rl, 'Enter Admin Username (e.g. admin): ');
    }
    if (!name) {
      name = await askQuestion(rl, 'Enter Admin Full Name (e.g. System Administrator): ');
    }
    if (!email) {
      email = await askQuestion(rl, 'Enter Admin Email (e.g. admin@aaatech.com): ');
    }
    if (!password) {
      password = await askQuestion(rl, 'Enter Admin Password: ');
    }

    rl.close();
  }

  username = username.trim();
  name = (name || 'System Administrator').trim();
  email = (email || `${username}@aaatech.com`).trim();
  password = password.trim();

  if (!username) {
    console.error('❌ Error: Username is required.');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    // 1. Check if admin with this username already exists
    const [existingUsers] = await pool.query(
      'SELECT id, username, email FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    // 2. Hash password with bcrypt (salt rounds = 12)
    console.log('Hashing password securely with bcrypt (12 rounds)...');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      console.log(`⚠️  Admin account already exists for username "${existing.username}" (ID: ${existing.id}).`);
      
      // Update password hash
      await pool.query(
        'UPDATE admins SET password_hash = ?, name = ?, is_active = TRUE, updated_at = NOW() WHERE id = ?',
        [passwordHash, name, existing.id]
      );
      console.log(`✅ Successfully updated credentials for admin ID: ${existing.id} (${existing.username}).`);
    } else {
      // Insert new admin
      const [result] = await pool.query(
        'INSERT INTO admins (username, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [username, name, email, passwordHash, 'admin', true]
      );
      console.log(`✅ Admin account created successfully!`);
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Username: ${username}`);
      console.log(`   Role: admin`);
    }

    console.log('\n==================================================');
    console.log('Admin credentials are now active in MySQL database.');
    console.log('==================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error creating admin:', error.message);
    process.exit(1);
  }
}

main();
