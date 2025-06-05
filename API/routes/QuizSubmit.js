const express = require('express');
const router = express.Router();
const QuizSubmit = require('../models/QuizSubmit');

// Submit a quiz
router.post('/:quizId/submit', async (req, res) => {
  try {
    const { email, courseId, answers } = req.body;
    const quizId = req.params.quizId;

    if (!email || !courseId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Optionally: prevent duplicate submissions per user per quiz
    // const existing = await QuizSubmit.findOne({ quizId, email });
    // if (existing) return res.status(409).json({ error: 'Quiz already submitted.' });

    const submission = new QuizSubmit({
      quizId,
      courseId,
      email,
      answers
    });

    await submission.save();
    res.json({ message: 'Quiz submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;