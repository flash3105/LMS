const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { generateCertificatePDF } = require('../Utils/certificateGenerator');

// Get a user's profile by email
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    let profile = await Profile.findOne({ email });

    if (!profile) {
      profile = await Profile.create({ email, achievements: [], milestones: [], goals: [], certificates: [] });
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

//Certificate route
router.post('/:email/test-certificate', async (req, res) => {
  try {
    const { email } = req.params;
    const { studentName, courseName } = req.body;
    
    let profile = await Profile.findOne({ email });
    if (!profile) {
      profile = new Profile({ email, certificates: [] });
    }
    
    const certificateId = `TEST-${Date.now()}`;
    const certificateUrl = await generateCertificatePDF({
      certificateId,
      studentName: studentName || "Test Student",
      courseName: courseName || "Test Course",
      grade: "Grade 10",
      completionDate: new Date(),
      status: "completed"
    });
    
    profile.certificates.push({
      certificateId,
      title: `${courseName || "Test Course"} Certificate`,
      courseName: courseName || "Test Course",
      grade: "Grade 10",
      issueDate: new Date(),
      completionDate: new Date(),
      certificateUrl,
      status: "completed"
    });
    
    await profile.save();
    
    res.json({ 
      message: 'Test certificate created successfully',
      certificate: profile.certificates[profile.certificates.length - 1]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get certificates for a user
router.get('/:email/certificates', async (req, res) => {
  try {
    const email = req.params.email;
    const profile = await Profile.findOne({ email });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile.certificates || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific certificate
router.get('/:email/certificates/:certificateId', async (req, res) => {
  try {
    const { email, certificateId } = req.params;
    const profile = await Profile.findOne({ email });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const certificate = profile.certificates.id(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;