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
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      enrolledCourses: user.enrolledCourses
    });
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


module.exports = router;