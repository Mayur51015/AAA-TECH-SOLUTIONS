const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    console.log("📊 ADMIN STATS REQUESTED");

    // COUNT - safe ah
    let enrollCount = 0;
    let contactCount = 0;

    try {
      const [r] = await db.query('SELECT COUNT(*) as count FROM enrollments');
      enrollCount = r[0].count;
    } catch(e) { console.log("enrollments table illa:", e.message); }

    try {
      const [r] = await db.query('SELECT COUNT(*) as count FROM contacts');
      contactCount = r[0].count;
    } catch(e) { console.log("contacts table illa:", e.message); }

    // RECENT DATA - id va thaan sort pannanum, created_at vendaam
    let recentEnrollments = [];
    let recentInquiries = [];

    try {
      const [rows] = await db.query('SELECT * FROM enrollments ORDER BY id DESC LIMIT 20');
      recentEnrollments = rows;
    } catch(e) { console.log("recentEnroll error:", e.message); }

    try {
      const [rows] = await db.query('SELECT * FROM contacts ORDER BY id DESC LIMIT 20');
      recentInquiries = rows;
    } catch(e) { console.log("recentContact error:", e.message); }

    console.log(`✅ FINAL STATS: Enroll=${enrollCount} | Inquiry=${contactCount}`);

    res.json({
      totalEnrollments: enrollCount,
      totalInquiries: contactCount,
      totalReviews: 0,
      totalApplications: 0,
      totalBlogs: 0,
      recentEnrollments,
      recentInquiries,
      recentApplications: [],
      reviews: []
    });

  } catch (err) {
    console.error("❌ STATS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllEnrollments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enrollments ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contacts ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
};