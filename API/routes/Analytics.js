const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// Route: Log an analytics action
router.post('/analytics', async (req, res) => {
  try {
    console.log('Analytics received:', req.body); // <-- Add this line
    const analytics = new Analytics(req.body);
    await analytics.save();
    res.status(201).json({ message: 'Analytics logged', analytics });
  } catch (error) {
    console.error('Error logging analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get analytics (optionally filter by user, course, action, etc.)
router.get('/analytics', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.action) filter.action = req.query.action;
    const analytics = await Analytics.find(filter).sort({ createdAt: -1 });
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;