const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bhavani',
  database: 'aaa_tech_db'
});

db.connect(err => {
  if(err) console.log("DB Error:", err);
  else console.log("DB Connected - aaa_tech_db");
});

const handleEnroll = (req, res) => {
  console.log("FRONTEND DATA:", req.body);
  const fullName = req.body.student_name || req.body.fullName || req.body.name || "";
  const email = req.body.email || "";
  const phone = req.body.phone || "";
  const course = req.body.course_name || req.body.course || "Java Full-Stack";
  const plan = req.body.plan || "premium";
  const msg = req.body.message || "";

  const sql = "INSERT INTO enrollments (full_name, name, phone, mobile, email, course_name, plan, message) VALUES (?,?,?,?,?,?,?,?)";
  db.query(sql, [fullName, fullName, phone, phone, email, course, plan, msg], (err, result) => {
    if(err) {
      console.log("INSERT ERROR:", err);
      if(err.code === 'ER_BAD_FIELD_ERROR') {
        const sql2 = "INSERT INTO enrollments (full_name, name, phone, mobile, email, course_name) VALUES (?,?,?,?,?,?)";
        return db.query(sql2, [fullName, fullName, phone, phone, email, course], (err2, result2) => {
          if(err2) return res.status(500).json({ error: err2.message });
          console.log("SUCCESS ID (fallback):", result2.insertId);
          return res.json({ success: true, id: result2.insertId });
        });
      }
      return res.status(500).json({ error: err.message });
    }
    console.log("SUCCESS ID:", result.insertId);
    res.json({ success: true, id: result.insertId });
  });
};

app.post('/api/enroll', handleEnroll);
app.post('/api/enrollments', handleEnroll);
app.post('/api/applications', handleEnroll);

app.post('/api/contacts', (req, res) => {
  console.log("CONTACT DATA:", req.body);
  const { name, email, phone, message, inquiryType } = req.body;
  const sql = "INSERT INTO contacts (name, email, phone, message, inquiryType) VALUES (?,?,?,?,?)";
  db.query(sql, [name, email, phone, message, inquiryType || 'General'], (err, result) => {
    if(err) {
      const sql2 = "INSERT INTO contacts (name, email, phone, message) VALUES (?,?,?,?)";
      return db.query(sql2, [name, email, phone, message], (err2, r2) => {
        if(err2) return res.status(500).json({ error: err2.message });
        console.log("CONTACT SUCCESS:", r2.insertId);
        return res.json({ success: true, id: r2.insertId });
      });
    }
    console.log("CONTACT SUCCESS:", result.insertId);
    res.json({ success: true, id: result.insertId });
  });
});

app.get('/api/enrollments', (req, res) => {
  db.query("SELECT * FROM enrollments ORDER BY id DESC", (err, r) => {
    if(err) return res.json([]);
    res.json(r);
  });
});
app.get('/api/applications', (req, res) => {
  db.query("SELECT * FROM enrollments ORDER BY id DESC", (err, r) => {
    if(err) return res.json([]);
    res.json(r);
  });
});
app.get('/api/contacts', (req, res) => {
  db.query("SELECT * FROM contacts ORDER BY id DESC", (err, r) => {
    if(err) return res.json([]);
    res.json(r);
  });
});
app.get('/api/inquiries', (req, res) => {
  db.query("SELECT * FROM contacts ORDER BY id DESC", (err, r) => {
    if(err) return res.json([]);
    res.json(r);
  });
});

// ITHU THAAN 0 COUNT FIX DA!
app.get('/api/admin/stats', (req, res) => {
  db.query("SELECT (SELECT COUNT(*) FROM enrollments) as totalEnrollments, (SELECT COUNT(*) FROM contacts) as totalInquiries, (SELECT COUNT(*) FROM reviews) as totalReviews", (err, r) => {
    if(err) {
      console.log("STATS ERROR:", err);
      return res.json({ totalEnrollments: 0, totalInquiries: 0, totalReviews: 0, enrollments:0, inquiries:0, reviews:0 });
    }
    const row = r[0];
    res.json({
      totalEnrollments: row.totalEnrollments,
      totalInquiries: row.totalInquiries,
      totalReviews: row.totalReviews,
      enrollments: row.totalEnrollments,
      inquiries: row.totalInquiries,
      reviews: row.totalReviews,
      stats: row
    });
  });
});

app.post('/api/admin/login', (req, res) => {
  console.log("ADMIN LOGIN TRY:", req.body);
  const { email, password } = req.body;
  if(email && password) {
    return res.json({ success: true, token: 'admin-token-123', admin: { email } });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});
app.post('/api/login', (req, res) => { res.json({ success: true, token: 'admin-token-123' }); });
app.post('/api/auth/login', (req, res) => { res.json({ success: true, token: 'admin-token-123' }); });

app.listen(5000, () => console.log("Server running on http://localhost:5000 - ALL 404 FIXED & 0 COUNT FIXED"));