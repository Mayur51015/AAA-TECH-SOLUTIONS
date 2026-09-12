const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const CoursePlan = require('../models/CoursePlan');

// @desc    Submit new course enrollment application
// @route   POST /api/enrollments
exports.submitEnrollment = async (req, res, next) => {
  try {
    const {
      fullName,
      student_name,
      full_name,
      mobile,
      phone,
      email,
      course,
      course_id,
      courseId,
      course_name,
      plan,
      plan_id,
      plan_name,
      message,
      goals
    } = req.body;

    const candidateName = (fullName || student_name || full_name || '').trim();
    const candidateMobile = (mobile || phone || '').trim();
    const candidateEmail = (email || '').trim();
    const candidateMessage = (message || goals || '').trim();

    // --- Input Validation ---
    if (!candidateName) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }

    if (!candidateMobile || candidateMobile.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidateEmail || !emailRegex.test(candidateEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // 1. Resolve Course ID
    let resolvedCourseId = null;
    const rawCourse = course_id || courseId || course || course_name;

    if (!rawCourse) {
      return res.status(400).json({ success: false, message: 'Course selection is required.' });
    }

    if (!isNaN(rawCourse) && Number(rawCourse) > 0) {
      resolvedCourseId = parseInt(rawCourse, 10);
    } else {
      // Try by slug
      const foundBySlug = await Course.findBySlug(String(rawCourse).toLowerCase());
      if (foundBySlug) {
        resolvedCourseId = foundBySlug.id;
      } else {
        // Fallback: match by title
        const allCourses = await Course.findAll(false);
        const matched = allCourses.find(c =>
          c.title.toLowerCase().includes(String(rawCourse).toLowerCase()) ||
          c.slug.toLowerCase().includes(String(rawCourse).toLowerCase())
        );
        resolvedCourseId = matched ? matched.id : null;
      }
    }

    // Verify course exists and is active
    if (resolvedCourseId) {
      const courseRecord = await Course.findById(resolvedCourseId);
      if (!courseRecord) {
        return res.status(404).json({ success: false, message: 'Selected course not found.' });
      }
      if (!courseRecord.is_active) {
        return res.status(400).json({ success: false, message: 'Selected course is no longer available.' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    // 2. Resolve Plan ID
    let resolvedPlanId = null;
    const rawPlan = plan_id || plan || plan_name;

    if (rawPlan) {
      if (!isNaN(rawPlan) && Number(rawPlan) > 0) {
        resolvedPlanId = parseInt(rawPlan, 10);
      } else {
        const foundByName = await CoursePlan.findByName(String(rawPlan));
        if (foundByName) {
          resolvedPlanId = foundByName.id;
        } else {
          const allPlans = await CoursePlan.findAll(false);
          const matched = allPlans.find(p =>
            p.name.toLowerCase() === String(rawPlan).toLowerCase() ||
            String(rawPlan).toLowerCase().includes(p.name.toLowerCase())
          );
          resolvedPlanId = matched ? matched.id : null;
        }
      }

      // Verify plan exists and is active if supplied
      if (resolvedPlanId) {
        const planRecord = await CoursePlan.findById(resolvedPlanId);
        if (!planRecord) {
          return res.status(404).json({ success: false, message: 'Selected plan not found.' });
        }
        if (!planRecord.is_active) {
          return res.status(400).json({ success: false, message: 'Selected plan is no longer available.' });
        }
      }
    }

    // 3. Save to database
    const enrollmentId = await Enrollment.create({
      full_name: candidateName,
      mobile: candidateMobile,
      email: candidateEmail,
      course_id: resolvedCourseId,
      plan_id: resolvedPlanId,
      message: candidateMessage,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully.',
      data: {
        id: enrollmentId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments (Admin)
// @route   GET /api/enrollments
exports.getEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll();
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enrollment by ID (Admin)
// @route   GET /api/enrollments/:id
exports.getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment status (Admin)
// @route   PATCH /api/enrollments/:id/status
exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    await Enrollment.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Enrollment status updated to '${status}'` });
  } catch (error) {
    next(error);
  }
};
