const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get a user's profile by email
router.get('/:email', async (req, res) => {
  try {
    let profile = await Profile.findOne({ email: req.params.email });
    if (!profile) {
      profile = await Profile.create({ email: req.params.email, achievements: [], milestones: [], goals: [] });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a goal using email as ID
router.post('/:email/goals', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { email: req.params.email },
      { $push: { goals: req.body } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a goal by goal ID for a user (using email)
router.delete('/:email/goals/:goalId', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { email: req.params.email },
      { $pull: { goals: { _id: req.params.goalId } } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;