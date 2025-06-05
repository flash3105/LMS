const mongoose = require('mongoose');

const QuizSubmitSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  answers: [
    {
      question: String,
      answer: String
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizSubmit', QuizSubmitSchema);