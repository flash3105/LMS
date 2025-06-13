const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Quiz = require('../models/Quiz');

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

module.exports = router;