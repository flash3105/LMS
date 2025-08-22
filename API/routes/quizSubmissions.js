const express = require("express");
const router = express.Router();
const QuizSubmit = require("../models/QuizSubmit");


// quick health check to confirm mounting:
router.get('/ping', (req, res) => res.json({ ok: true }));

// Get all submissions for a user in a course
router.get("/:courseId/:email", async (req, res) => {
  try {
    const { courseId, email } = req.params;
    const submissions = await QuizSubmit.find({ courseId, email });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;