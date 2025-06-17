const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User'); // Import User model at top level

// Enhanced GET profile endpoint
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        suggestion: 'Please check the email or register first'
      });
    }

    // Create profile if doesn't exist
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({ 
        user: user._id,
        goals: [],
        achievements: [],
        milestones: []
      });
    }

    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Enhanced goal addition endpoint
router.post('/:email/goals', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.text) {
      return res.status(400).json({ error: 'Goal text is required' });
    }

    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const goalData = {
      text: req.body.text,
      completed: req.body.completed || false,
      createdAt: new Date(),
      _id: new mongoose.Types.ObjectId() // Generate ID upfront
    };

    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { $push: { goals: goalData } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      goal: goalData,
      profile: profile
    });
  } catch (err) {
    console.error('Goal addition error:', err);
    res.status(500).json({ 
      error: 'Failed to add goal',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Add this new endpoint for goal deletion
router.delete('/:email/goals/:goalId', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { $pull: { goals: { _id: req.params.goalId } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (err) {
    console.error('Goal deletion error:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;