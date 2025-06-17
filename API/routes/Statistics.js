const express = require('express');
const router = express.Router();
const Statistics = require('../models/Statistics');

// Get all statistics (latest)
router.get('/', async (req, res) => {
  try {
    // Get the latest statistics document
    const stats = await Statistics.findOne().sort({ date: -1 });
    if (!stats) return res.status(404).json({ error: 'No statistics found' });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get grades per course
router.get('/grades-per-course', async (req, res) => {
  try {
    const stats = await Statistics.findOne().sort({ date: -1 });
    if (!stats || !stats.gradesPerCourse) return res.status(404).json({ error: 'No grades data found' });
    res.json(stats.gradesPerCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update statistics (admin only)
router.post('/', async (req, res) => {
  try {
    const stats = await Statistics.create(req.body);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;