const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Create a quiz
router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get quizzes for a course
router.get('/courses/:courseId/quizzes', async (req, res) => {
  const quizzes = await Quiz.find({ courseId: req.params.courseId });
  res.json(quizzes);
});

// Get all quizzes
router.get('/quizzes/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
});

module.exports = router;