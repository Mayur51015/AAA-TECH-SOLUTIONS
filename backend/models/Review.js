const pool = require('../config/db');

class Review {
  static async findApproved() {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.course_id,
        r.rating,
        r.review_text,
        r.status,
        r.created_at,
        c.title AS course_title
      FROM reviews r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.status = 'approved'
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async findAll() {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.course_id,
        r.rating,
        r.review_text,
        r.status,
        r.created_at,
        c.title AS course_title
      FROM reviews r
      LEFT JOIN courses c ON r.course_id = c.id
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async create(data) {
    const { name, course_id, rating, review_text } = data;
    const [result] = await pool.query(
      'INSERT INTO reviews (name, course_id, rating, review_text, status) VALUES (?, ?, ?, ?, ?)',
      [name, course_id || null, rating || 5, review_text, 'pending']
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  static async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Review;
