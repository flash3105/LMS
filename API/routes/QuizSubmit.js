const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const QuizSubmit = require('../models/QuizSubmit');
const Profile = require('../models/Profile');
const Quiz = require('../models/Quiz'); 

// Submit a quiz
router.post('/:quizId/submit', async (req, res) => {
  try {
    const { email, courseId, answers } = req.body;
    const quizId = req.params.quizId;

    if (!email || !courseId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Get the quiz to check answers - use the imported Quiz model
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const userAnswer = answers[idx]?.answer;
      if (userAnswer && userAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const grade = Math.round((correctCount / totalQuestions) * 100);

    // Save submission
    const submission = new QuizSubmit({
      quizId,
      courseId,
      email,
      answers,
      grade
    });

    await submission.save();

    // Check if score is 80% or higher and add milestone
    if (grade >= 80) {
      await addQuizMilestone(email, quiz.title, grade, courseId);
    }

    res.json({ 
      message: 'Quiz submitted successfully.',
      grade: grade,
      correctCount: correctCount,
      totalQuestions: totalQuestions
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Helper function to add quiz milestone
async function addQuizMilestone(email, quizTitle, score, courseId) {
  try {
    // Check if milestone already exists for this quiz
    const profile = await Profile.findOne({ email });
    if (!profile) {
      console.log('Profile not found for email:', email);
      return;
    }

    const existingMilestone = profile.milestones.find(m => 
      m.title.includes(quizTitle) && m.description.includes(`Scored ${score}%`)
    );

    if (existingMilestone) {
      return; // Milestone already exists
    }

    // Add new milestone
    const milestone = {
      title: `Quiz Excellence: ${quizTitle}`,
      description: `Scored ${score}% on ${quizTitle} quiz`,
      achievedOn: new Date(),
      courseId: courseId,
      type: 'quiz'
    };

    await Profile.findOneAndUpdate(
      { email },
      { $push: { milestones: milestone } },
      { new: true, upsert: true }
    );

    console.log(`Added milestone for ${email}: Scored ${score}% on ${quizTitle}`);
  } catch (err) {
    console.error('Error adding quiz milestone:', err);
  }
}

module.exports = router;