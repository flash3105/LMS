const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizSubmit = require('../models/QuizSubmit');

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


router.get('/courses/:courseId/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/courses/:courseId/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all submitted quizzes for a user in a specific course
router.get('/user/:email/course/:courseId', async (req, res) => {
  console.log('GET submissions for', req.params); // server log
  try {
    const { email, courseId } = req.params;

    if (!email || !courseId) {
      return res.status(400).json({ error: 'Email and courseId are required.' });
    }

    const submissions = await QuizSubmit.find({ email, courseId }).populate('quizId');

    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching submitted quizzes:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


module.exports = router;