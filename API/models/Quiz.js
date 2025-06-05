const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String], // e.g. ["A", "B", "C", "D"]
  correctAnswer: { type: String, required: true }
});

const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  dueDate: { type: Date }, // <-- Added dueDate field
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);