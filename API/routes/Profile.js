const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get a user's profile by email
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    let profile = await Profile.findOne({ email });

    if (!profile) {
      profile = await Profile.create({ email, achievements: [], milestones: [], goals: [] });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//Edit profile
router.patch('/edit/:email', async (req, res) => {
  const email = req.params.email;
  const { bio } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const profile = await Profile.findOneAndUpdate(
      { email },
      { $set: { bio: bio || '' } }, // only update bio
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a goal
router.post('/:email/goals', async (req, res) => {
  const email = req.params.email;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: 'Goal text is required' });

  try {
    const profile = await Profile.findOneAndUpdate(
      { email },
      { $push: { goals: { text, completed: false } } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a goal
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

// Update goal status
router.patch('/:email/goals/:goalId', async (req, res) => {
  try {
    const { completed } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { email: req.params.email, "goals._id": req.params.goalId },
      { $set: { "goals.$.completed": completed } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ error: 'Profile or goal not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
