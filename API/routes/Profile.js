const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get a user's profile by email instead of userId
router.get('/:email', async (req, res) => {
  try {
    // Find the user by email
    const user = await require('../models/User').findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the profile by user._id
    const profile = await Profile.findOne({ user: user._id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a user's profile
router.post('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an achievement
router.post('/:userId/achievements', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $push: { achievements: req.body } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a milestone
router.post('/:userId/milestones', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $push: { milestones: req.body } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a goal
router.post('/:userId/goals', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $push: { goals: req.body } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a goal using user's email
router.post('/:email/goals', async (req, res) => {
  try {
    // Find the user by email
    const user = await require('../models/User').findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Add the goal to the user's profile
    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { $push: { goals: req.body } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;