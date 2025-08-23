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

// Edit profile
router.patch('/edit/:email', async (req, res) => {
  const email = req.params.email;
  const { bio } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const profile = await Profile.findOneAndUpdate(
      { email },
      { $set: { bio: bio || '' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new goal
router.post("/:email/goals", async (req, res) => {
  const email = req.params.email;
  const { title, description, targetDate, priority } = req.body;

  if (!title) return res.status(400).json({ error: "Goal title is required" });

  try {
    // Convert priority to proper case to match schema enum
    const formattedPriority = priority 
      ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
      : "Medium";

    const profile = await Profile.findOneAndUpdate(
      { email },
      {
        $push: {
          goals: {
            title,
            description: description || "",
            targetDate: targetDate || null,
            priority: formattedPriority
          }
        }
      },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    console.error("Error adding goal:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete goal by index
router.delete("/:email/goals/:index", async (req, res) => {
  const email = req.params.email;
  const index = parseInt(req.params.index);

  try {
    const profile = await Profile.findOne({ email });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (index < 0 || index >= profile.goals.length) {
      return res.status(400).json({ error: "Invalid goal index" });
    }

    // Remove the goal at the specified index
    profile.goals.splice(index, 1);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;