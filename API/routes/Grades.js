const express = require('express');
const router = express.Router();
const Grades = require('../models/Grades');

// Create or update a grade
router.post('/', async (req, res) => {
  try {
    const { type, refId, courseId, email, grade, feedback } = req.body;
    if (!type || !refId || !courseId || !email || grade === undefined) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Upsert: update if exists, else create
    const updated = await Grades.findOneAndUpdate(
      { type, refId, courseId, email },
      { grade, feedback, gradedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err); // Add this line to see the real error in your terminal
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all grades for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const grades = await Grades.find({ courseId });
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all grades for a user (across all courses)
router.get('/user/:email/course/all', async (req, res) => {
  try {
    const { email } = req.params;
    const grades = await Grades.find({ email });
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all grades for a user in a course
router.get('/user/:email/course/:courseId', async (req, res) => {
  try {
    const { email, courseId } = req.params;
    const grades = await Grades.find({ email, courseId });
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all grades for all students (admin/teacher)
router.get('/all', async (req, res) => {
  try {
    const grades = await Grades.find();
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;