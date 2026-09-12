const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class Admin {
  /**
   * Find admin by username (includes password_hash and is_active for authentication)
   */
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  }

  /**
   * Find admin by username or email identifier
   */
  static async findByIdentifier(identifier) {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    return rows[0] || null;
  }

  /**
   * Find admin by ID (excludes password_hash for security)
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role, is_active, created_at, updated_at FROM admins WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Compare plaintext password against bcrypt hash
   */
  static async matchPassword(enteredPassword, hashedPassword) {
    if (!enteredPassword || !hashedPassword) return false;
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  /**
   * Create new admin user with 12 bcrypt salt rounds
   */
  static async create(data) {
    const { username, name, email, password, role } = data;
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO admins (username, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [username, name || 'Administrator', email || null, password_hash, role || 'admin', true]
    );
    return result.insertId;
  }

  /**
   * Find all admins (excludes password_hash)
   */
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role, is_active, created_at, updated_at FROM admins ORDER BY id ASC'
    );
    return rows;
  }
}

module.exports = Admin;
