/**
 * Database Schema Initializer & Migration Tool
 * AAA Tech Solutions
 * 
 * Idempotently verifies and creates all 10 required tables in MySQL / TiDB Cloud
 * without altering or dropping existing tables or data.
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const tableDefinitions = [
  {
    name: 'courses',
    sql: `
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        duration VARCHAR(100),
        level VARCHAR(100),
        category VARCHAR(100),
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'course_plans',
    sql: `
      CREATE TABLE IF NOT EXISTS course_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        billing_period VARCHAR(100) DEFAULT '',
        description TEXT,
        is_popular BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'enrollments',
    sql: `
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        course_id INT NULL,
        plan_id INT NULL,
        message TEXT,
        status ENUM('pending', 'contacted', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
        FOREIGN KEY (plan_id) REFERENCES course_plans(id) ON DELETE SET NULL
      );
    `
  },
  {
    name: 'contacts',
    sql: `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255) DEFAULT 'General Inquiry',
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'reviews',
    sql: `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        course_id INT NULL,
        rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
        review_text TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      );
    `
  },
  {
    name: 'careers',
    sql: `
      CREATE TABLE IF NOT EXISTS careers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(150) NOT NULL,
        employment_type VARCHAR(100) DEFAULT 'Full-Time',
        description TEXT,
        requirements TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'applications',
    sql: `
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        career_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        resume_url VARCHAR(500),
        message TEXT,
        status ENUM('pending', 'reviewed', 'shortlisted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
      );
    `
  },
  {
    name: 'projects',
    sql: `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        technologies VARCHAR(255),
        project_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'blog_posts',
    sql: `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        featured_image VARCHAR(500),
        author VARCHAR(150) DEFAULT 'AAA Tech Team',
        status ENUM('draft', 'published') DEFAULT 'published',
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'admins',
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `
  }
];

async function initDatabase() {
  console.log('🔄 Checking database schema and initializing missing tables...');
  
  for (const table of tableDefinitions) {
    try {
      await pool.query(table.sql);
      console.log(`  ✓ Table '${table.name}' verified/ready.`);
    } catch (err) {
      console.error(`  ❌ Failed to create/verify table '${table.name}':`, err.message);
      throw err;
    }
  }

  // Seed default careers if empty so applications have valid job listings to join
  try {
    const [careerRows] = await pool.query('SELECT COUNT(*) as count FROM careers');
    if (careerRows[0].count === 0) {
      console.log('🌱 Seeding initial career openings...');
      const defaultCareers = [
        [
          'Full-Stack Developer (React & Node.js)',
          'Chennai (Hybrid / On-site)',
          'Full-Time',
          'Build scalable web applications, REST APIs, and responsive customer portals.',
          '2+ years experience with React, Node.js, Express, and SQL/NoSQL databases.',
          true
        ],
        [
          'Cloud & DevOps Engineer',
          'Chennai (Hybrid / Remote)',
          'Full-Time',
          'Design and maintain AWS infrastructure, CI/CD pipelines, and Docker containers.',
          'Experience with AWS services, Terraform, Docker, and Linux system administration.',
          true
        ],
        [
          'Technical Trainer / Mentor',
          'Chennai (On-site / Flexible)',
          'Full-Time / Part-Time',
          'Mentor prospective developers in modern full-stack development and cloud engineering.',
          'Strong command of JavaScript/TypeScript, Java or Python with a passion for teaching.',
          true
        ]
      ];
      await pool.query(
        'INSERT INTO careers (title, location, employment_type, description, requirements, is_active) VALUES ?',
        [defaultCareers]
      );
      console.log('  ✓ Seeded 3 default career openings.');
    }
  } catch (err) {
    console.warn('  ⚠️ Note on careers seeding:', err.message);
  }

  console.log('✅ Database schema verified. All required tables are present.\n');
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 Database initialization finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization error:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase, tableDefinitions };
