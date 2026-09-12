-- =======================================================
-- AAA TECH SOLUTIONS — COMPLETE PRODUCTION DATABASE
-- Database Name: aaa_tech_db
-- =======================================================

CREATE DATABASE IF NOT EXISTS aaa_tech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aaa_tech_db;

-- -------------------------------------------------------
-- 1. ADMIN USERS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial admin via `npm run create-admin` CLI tool with bcrypt hashing (12 rounds)

-- -------------------------------------------------------
-- 2. CONTACT MESSAGES TABLE (Contact Page Submissions)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  inquiry_type VARCHAR(100) DEFAULT 'Enterprise Software Development',
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'New', -- 'New', 'In Review', 'Resolved'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Contact Inquiries
INSERT INTO contact_messages (name, email, phone, inquiry_type, message, status) VALUES
('Rajesh Kumar', 'rajesh.k@innovate.in', '+91 98450 12345', 'Enterprise Software Development', 'We are looking for a scalable cloud ERP migration for our manufacturing plant.', 'New'),
('Sneha Sharma', 'sneha.sharma@techcorp.com', '+91 97123 45678', 'AI & Data Engineering', 'Interested in building an automated customer analytics pipeline.', 'In Review');

-- -------------------------------------------------------
-- 3. ENROLLMENTS TABLE (Course & Workshop Applications)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  course_name VARCHAR(200) NOT NULL DEFAULT 'Full Stack Engineering',
  plan VARCHAR(100) NOT NULL DEFAULT 'Standard',
  message TEXT,
  course_id INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Course Enrollments
INSERT INTO enrollments (student_name, email, phone, course_name, plan, message, course_id, status) VALUES
('Ananya Verma', 'ananya.v@gmail.com', '+91 98234 56789', 'Full-Stack Web Development Mastery', 'Monthly (₹1,500/mo)', 'Looking to switch career to frontend/full-stack engineering.', 1, 'Confirmed'),
('Karthik Raja', 'karthik.raja@outlook.com', '+91 91234 56780', 'Cloud Architecture & DevOps with AWS', '2-Month (₹3,000)', 'Have 2 years backend experience, looking to learn Docker/K8s/Terraform.', 2, 'Pending');

-- -------------------------------------------------------
-- 4. COURSES CATALOG TABLE (Training Academy)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) DEFAULT 'Intermediate',
  duration VARCHAR(50) DEFAULT '12 Weeks',
  price DECIMAL(10, 2) DEFAULT 0.00,
  instructor VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 4.9,
  students_count INT DEFAULT 0,
  short_description TEXT,
  syllabus_json JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Courses from Data Model
INSERT INTO courses (slug, title, category, level, duration, price, instructor, rating, students_count, short_description) VALUES
('fullstack-development', 'Full-Stack Web Development Mastery', 'Software Engineering', 'Beginner to Pro', '12 Weeks', 3000.00, 'Arun Prakash (Senior Architect)', 4.95, 340, 'Master modern full-stack development with React, Node.js, Express, MySQL/Postgres and cloud deployment.'),
('cloud-devops', 'Cloud Architecture & DevOps with AWS & GCP', 'Cloud & Infra', 'Intermediate to Advanced', '10 Weeks', 3500.00, 'Bhavani Shankar (Cloud Solutions Lead)', 4.90, 280, 'Hands-on CI/CD pipelines, Docker containerization, Kubernetes orchestration, and Terraform infrastructure as code.'),
('ai-machine-learning', 'Applied AI, Machine Learning & LLMs', 'Data & AI', 'Intermediate', '14 Weeks', 5000.00, 'Dr. Meera Nambiar (AI Research Scientist)', 4.92, 195, 'Practical machine learning, neural networks, PyTorch, LangChain, and production GenAI app architecture.'),
('ui-ux-design', 'Enterprise UI/UX Design & Product Strategy', 'Design & Product', 'All Levels', '8 Weeks', 2500.00, 'Kavya Ramesh (Head of Product Design)', 4.88, 220, 'Figma masterclass, design systems, micro-interactions, responsive UX heuristics, and user research methodologies.');

-- -------------------------------------------------------
-- 5. SERVICES TABLE (Client Solutions)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  tagline VARCHAR(255),
  description TEXT,
  technologies_json JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Services
INSERT INTO services (title, slug, tagline, description) VALUES
('Custom Software Development', 'custom-software', 'Bespoke high-performance software built for scale.', 'End-to-end bespoke software engineered with scalable microservices, secure APIs, and responsive web platforms.'),
('Cloud Transformation & DevOps', 'cloud-devops', 'Resilient, automated cloud infrastructure.', 'Modernize your workloads across AWS, GCP, and Azure with Kubernetes, serverless paradigms, and zero-downtime CI/CD.'),
('AI & Data Intelligence', 'ai-data', 'Turn enterprise data into actionable intelligence.', 'Tailored machine learning models, natural language intelligence, real-time analytics, and automated decision pipelines.'),
('IT Consulting & Digital Strategy', 'it-consulting', 'Strategic advisory for digital-first enterprises.', 'Architecture reviews, security compliance, technology audits, and roadmaps designed for long-term ROI.');

-- -------------------------------------------------------
-- 6. PROJECTS & CASE STUDIES TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  client VARCHAR(100),
  category VARCHAR(100),
  impact VARCHAR(200),
  description TEXT,
  technologies VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Projects
INSERT INTO projects (title, client, category, impact, description, technologies) VALUES
('FinTech Payment Gateway Core', 'Apex Financial Systems', 'Financial Technology', 'Processed 10M+ daily transactions at 99.999% uptime', 'Ultra-low latency transaction clearing engine with PCI-DSS compliance.', 'Node.js, PostgreSQL, Redis, AWS ECS, Kafka'),
('Healthcare EHR & Telemedicine', 'MedPulse Healthcare', 'HealthTech', 'Connected 50,000+ patients across 35 hospitals', 'HIPAA-compliant telemedicine platform with WebRTC consultation and AI triage.', 'React, Express, MySQL, WebRTC, Docker'),
('Supply Chain Logistics Hub', 'LogiTrans Global', 'Supply Chain', 'Reduced turnaround dispatch latency by 42%', 'Real-time GPS fleet tracking, automated route dispatching, and dynamic load balancing.', 'React Native, Node.js, Google Maps API, GCP');
