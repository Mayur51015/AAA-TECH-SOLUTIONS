const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isSSL = process.env.DB_SSL === 'true' || 
              (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com')) ||
              (process.env.DB_PORT && parseInt(process.env.DB_PORT, 10) === 4000) ||
              Boolean(process.env.DB_SSL_CA);

function getSslConfig() {
  if (!isSSL) return undefined;
  const ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
  if (process.env.DB_SSL_CA) {
    try {
      if (fs.existsSync(process.env.DB_SSL_CA)) {
        ssl.ca = fs.readFileSync(process.env.DB_SSL_CA);
      } else {
        ssl.ca = process.env.DB_SSL_CA;
      }
    } catch (e) {
      console.warn('⚠️ Could not load DB_SSL_CA in seed.js:', e.message);
    }
  }
  return ssl;
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const sslConfig = getSslConfig();
if (sslConfig) {
  dbConfig.ssl = sslConfig;
}

const DB_NAME = process.env.DB_NAME || 'aaa_tech_solutions';

async function seedDatabase() {
  let connection;
  try {
    const sslLabel = isSSL ? ' (SSL/TLS Enabled)' : '';
    console.log(`📡 Connecting to MySQL/TiDB server at ${dbConfig.host}:${dbConfig.port}${sslLabel}...`);
    connection = await mysql.createConnection(dbConfig);

    // 1. Create and switch to Database
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    } catch (e) {
      // On some managed cloud instances (e.g. TiDB Serverless), DB is pre-allocated
      console.log(`ℹ️ Note on database creation: ${e.message}`);
    }
    await connection.query(`USE \`${DB_NAME}\`;`);
    console.log(`✅ Using database: ${DB_NAME}`);

    // 2. Read and run schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✅ All 10 database tables created or verified successfully.');

    // ----------------------------------------------------
    // 3. Seed Course Plans (Numeric INR prices: 1000, 1500, 3000, 5000)
    // ----------------------------------------------------
    const [existingPlans] = await connection.query('SELECT COUNT(*) as count FROM course_plans');
    if (existingPlans[0].count === 0) {
      const plans = [
        ['Starter', 1000.00, 'Single Topic', 'Single Module / Topic', false, true],
        ['Monthly', 1500.00, 'per month', '1 Month Full Course', true, true],
        ['2-Month', 3000.00, 'for 2 months', '2 Month Full Course', false, true],
        ['Premium', 5000.00, 'one-time fee', 'Advanced Bundle', false, true]
      ];
      await connection.query(
        'INSERT INTO course_plans (name, price, billing_period, description, is_popular, is_active) VALUES ?',
        [plans]
      );
      console.log('✅ Seeded 4 Course Plans with numeric INR values (1000, 1500, 3000, 5000).');
    }

    // ----------------------------------------------------
    // 4. Seed Official Courses
    // ----------------------------------------------------
    const [existingCourses] = await connection.query('SELECT COUNT(*) as count FROM courses');
    if (existingCourses[0].count === 0) {
      const courses = [
        [
          'Full-Stack Software Engineering',
          'fullstack-software-engineering',
          'Master MERN + TypeScript + PostgreSQL with production deployments.',
          '16 Weeks',
          'Intermediate',
          'Software Development',
          '/assets/hero.png',
          true
        ],
        [
          'Java Full-Stack with Spring Boot',
          'java-springboot-microservices',
          'Enterprise Java, Spring Boot 3, Microservices, Kafka.',
          '20 Weeks',
          'Beginner to Advanced',
          'Software Development',
          '/assets/hero.png',
          true
        ],
        [
          'AWS Cloud & DevOps Engineering',
          'aws-devops-engineering',
          'Hands-on AWS, Terraform, Kubernetes orchestration, and CI/CD pipelines.',
          '12 Weeks',
          'Intermediate',
          'Cloud & Infrastructure',
          '/assets/hero.png',
          true
        ]
      ];
      await connection.query(
        'INSERT INTO courses (title, slug, description, duration, level, category, image_url, is_active) VALUES ?',
        [courses]
      );
      console.log('✅ Seeded official courses into database.');
    }

    // ----------------------------------------------------
    // 5. Seed Official Projects
    // ----------------------------------------------------
    const [existingProjects] = await connection.query('SELECT COUNT(*) as count FROM projects');
    if (existingProjects[0].count === 0) {
      const projects = [
        [
          'FinTech Payment Gateway Core',
          'fintech-payment-gateway',
          'Ultra-low latency transaction clearing engine with PCI-DSS compliance.',
          '',
          'Node.js, PostgreSQL, Redis, AWS ECS, Kafka',
          'https://aaatechsolutions.com',
          true
        ],
        [
          'Healthcare EHR & Telemedicine',
          'healthcare-ehr-telemedicine',
          'HIPAA-compliant telemedicine platform with WebRTC consultation and AI triage.',
          '',
          'React, Express, MySQL, WebRTC, Docker',
          'https://aaatechsolutions.com',
          true
        ],
        [
          'Supply Chain Logistics Hub',
          'supply-chain-logistics',
          'Real-time GPS fleet tracking, automated route dispatching, and dynamic load balancing.',
          '',
          'React Native, Node.js, Google Maps API, GCP',
          'https://aaatechsolutions.com',
          true
        ]
      ];
      await connection.query(
        'INSERT INTO projects (title, slug, description, image_url, technologies, project_url, is_active) VALUES ?',
        [projects]
      );
      console.log('✅ Seeded official portfolio projects.');
    }

    // ----------------------------------------------------
    // 6. Seed Official Careers
    // ----------------------------------------------------
    const [existingCareers] = await connection.query('SELECT COUNT(*) as count FROM careers');
    if (existingCareers[0].count === 0) {
      const careers = [
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
      await connection.query(
        'INSERT INTO careers (title, location, employment_type, description, requirements, is_active) VALUES ?',
        [careers]
      );
      console.log('✅ Seeded career openings.');
    }

    // ----------------------------------------------------
    // 7. Seed Official Blog Posts
    // ----------------------------------------------------
    const [existingBlogs] = await connection.query('SELECT COUNT(*) as count FROM blog_posts');
    if (existingBlogs[0].count === 0) {
      const blogs = [
        [
          'Roadmap to Becoming a Full-Stack Engineer in 2026',
          'roadmap-fullstack-engineer-2026',
          'A comprehensive guide outlining essential technologies, frameworks, and architecture practices.',
          'Modern software engineering requires a balance of strong foundational fundamentals and modern tooling...',
          '',
          'AAA Engineering Team',
          'published'
        ],
        [
          'Mastering Cloud DevOps: From Containerization to Production',
          'mastering-cloud-devops-production',
          'Why containerization and infrastructure as code have become mandatory standards for high-growth tech teams.',
          'Continuous delivery and infrastructure as code empower teams to deploy with confidence and speed...',
          '',
          'AAA Cloud Architecture Group',
          'published'
        ]
      ];
      await connection.query(
        'INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author, status) VALUES ?',
        [blogs]
      );
      console.log('✅ Seeded blog posts.');
    }

    // ----------------------------------------------------
    // 8. Seed Verified Student Reviews (Status = approved)
    // ----------------------------------------------------
    const [existingReviews] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    if (existingReviews[0].count === 0) {
      const reviews = [
        [
          'Priya S.',
          1,
          5,
          'The practical training was transformative! The engineering mentor explained full-stack architectures clearly with real examples and code reviews. Highly recommend AAA Tech Solutions!',
          'approved'
        ],
        [
          'Rahul M.',
          3,
          5,
          'Took the Cloud & DevOps mastery track. The hands-on labs with AWS and Docker are industry-level. The trainer mentoring and support made doubt clearing seamless.',
          'approved'
        ],
        [
          'Kavitha R.',
          1,
          5,
          'The curriculum and SQL course was excellent. 100% online, flexible schedule, and mock technical interview sessions really helped me crack my first engineering role.',
          'approved'
        ],
        [
          'Arjun T.',
          1,
          5,
          'Hands-on, component-driven design systems curriculum with React and Figma. The mentor was patient, knowledgeable, and gave deep feedback on real production portfolio pieces.',
          'approved'
        ]
      ];
      await connection.query(
        'INSERT INTO reviews (name, course_id, rating, review_text, status) VALUES ?',
        [reviews]
      );
      console.log('✅ Seeded approved student reviews.');
    }

    // ----------------------------------------------------
    // 9. Seed Default Admin User with Bcrypt Hash
    // ----------------------------------------------------
    const [existingAdmins] = await connection.query('SELECT COUNT(*) as count FROM admins');
    if (existingAdmins[0].count === 0) {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(rawPassword, salt);

      await connection.query(
        'INSERT INTO admins (username, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [adminUsername, 'Super Administrator', adminEmail, passwordHash, 'admin', true]
      );
      console.log(`✅ Default admin created: username="${adminUsername}", email="${adminEmail}" (password: ${rawPassword})`);
    }

    console.log('\n🎉 Database Initialization and Seeding Complete!\n');
  } catch (error) {
    console.error('❌ Error Seeding Database:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
