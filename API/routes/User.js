const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Quiz = require('../models/Quiz');
const MyCourses = require('../models/MyCourses');
const Enrollment = require('../models/Enrollment');

// GET: Return user's enrolled courses
router.get('/:userId/enrolled-courses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Assuming you store enrolledCourses as an array of course IDs or titles on the user
    // If not, adjust this logic to match your schema
    const courses = await Course.find({ _id: { $in: user.enrolledCourses } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Return user's assessments (from enrolled courses)
router.get('/:userId/assessments', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get enrolled courses
    const courses = await Course.find({ _id: { $in: user.enrolledCourses } });
    const courseIds = courses.map(c => c._id);

    // Find assessments for these courses
    const assessments = await Assessment.find({ course: { $in: courseIds } });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Return user's quizzes (from enrolled courses)
router.get('/:userId/quizzes', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get enrolled courses
    const courses = await Course.find({ _id: { $in: user.enrolledCourses } });
    const courseIds = courses.map(c => c._id);

    // Find quizzes for these courses
    const quizzes = await Quiz.find({ course: { $in: courseIds } });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: Get total registered users and their emails
router.get('/registered-users', async (req, res) => {
  try {
    const users = await User.find({}, 'email'); // Fetch all users and only their email field
    const totalUsers = users.length;

    res.status(200).json({
      totalUsers,
      emails: users.map(user => user.email)
    });
  } catch (error) {
    console.error('Error fetching registered users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//Get user by email
router.get('/email/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    // Fetch the user’s enrolled courses
    const userCourses = await MyCourses.findOne({ email }).populate('enrolledCourses');
    if (!userCourses) {
      return res.status(404).json({ message: 'No enrolled courses found for this user' });
    }

    // Fetch the user info
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const coursesWithEnrollment = [];

    // Loop through all enrolled courses
    for (const course of userCourses.enrolledCourses) {
      // Find existing enrollment
      let enrollment = await Enrollment.findOne({ user: user._id, course: course._id });

      // Create enrollment if it doesn’t exist
      if (!enrollment) {
        enrollment = new Enrollment({
          user: user._id,
          course: course._id,
          status: 'enrolled',
          progress: 0,
          certificateId: null,
        });
        await enrollment.save();
      }

      // Merge course data with enrollment info
      coursesWithEnrollment.push({
        ...course.toObject(),
        progress: enrollment.progress,
        status: enrollment.status,
        certificateId: enrollment.certificateId,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      level: user.level,
      enrolledCourses: coursesWithEnrollment,
      createdAt: userCourses.createdAt,
    });
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


module.exports = router;