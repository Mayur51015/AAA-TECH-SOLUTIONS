/**
 * Production & Local Endpoint Verification Script
 * AAA Tech Solutions
 */

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../app');
const pool = require('../config/db');
const { initDatabase } = require('../database/initDb');

async function makeRequest(port, method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function verify() {
  console.log('--- Step 1: Initialize Database Tables ---');
  await initDatabase();

  const testPort = 5055;
  const server = app.listen(testPort);
  console.log(`\n--- Step 2: Testing Local Server on port ${testPort} ---`);

  try {
    // 1. Health
    const health = await makeRequest(testPort, 'GET', '/health');
    console.log(`GET /health: status=${health.status}, statusText=${health.data?.status}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. API root
    const apiRoot = await makeRequest(testPort, 'GET', '/api');
    console.log(`GET /api: status=${apiRoot.status}, version=${apiRoot.data?.version}`);

    // 3. Courses
    const courses = await makeRequest(testPort, 'GET', '/api/courses');
    console.log(`GET /api/courses: status=${courses.status}, count=${courses.data?.count}`);
    if (courses.status !== 200) throw new Error('Courses check failed');

    // 4. Course Plans
    const plans = await makeRequest(testPort, 'GET', '/api/course-plans');
    console.log(`GET /api/course-plans: status=${plans.status}, count=${plans.data?.count}`);
    if (plans.status !== 200) throw new Error('Course plans check failed');

    // 5. Careers
    const careers = await makeRequest(testPort, 'GET', '/api/careers');
    console.log(`GET /api/careers: status=${careers.status}, count=${careers.data?.count}`);
    if (careers.status !== 200) throw new Error('Careers check failed');

    // 6. Reviews
    const reviews = await makeRequest(testPort, 'GET', '/api/reviews');
    console.log(`GET /api/reviews: status=${reviews.status}, count=${reviews.data?.count}`);
    if (reviews.status !== 200) throw new Error('Reviews check failed');

    // 7. Admin Login
    const login = await makeRequest(testPort, 'POST', '/api/admin/login', {
      username: 'admin@gmail.com',
      password: 'Mayur@12'
    });
    console.log(`POST /api/admin/login: status=${login.status}, success=${login.data?.success}`);
    if (login.status !== 200 || !login.data?.token) throw new Error('Admin login failed');

    const token = login.data.token;

    // 8. Protected: Admin Stats
    const stats = await makeRequest(testPort, 'GET', '/api/admin/stats', null, token);
    console.log(`GET /api/admin/stats: status=${stats.status}, enrollments=${stats.data?.data?.totalEnrollments}, apps=${stats.data?.data?.totalApplications}`);
    if (stats.status !== 200) throw new Error('Admin stats check failed');

    // 9. Protected: Applications Table
    const apps = await makeRequest(testPort, 'GET', '/api/applications', null, token);
    console.log(`GET /api/applications: status=${apps.status}, success=${apps.data?.success}, count=${apps.data?.count}`);
    if (apps.status !== 200) throw new Error('Applications check failed: ' + JSON.stringify(apps));

    // 10. Unauthenticated access check to /api/applications (Must be 401)
    const unauthApps = await makeRequest(testPort, 'GET', '/api/applications');
    console.log(`GET /api/applications (unauthenticated): status=${unauthApps.status} (Expected 401: Security Intact)`);
    if (unauthApps.status !== 401) throw new Error('Security check failed: unauthenticated access was not rejected');

    console.log('\n🎉 ALL LOCAL ENDPOINT TESTS PASSED WITH 0 ERRORS!');
  } finally {
    server.close();
    await pool.end();
  }
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
