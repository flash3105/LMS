const mongoose = require('mongoose');

const GradesSchema = new mongoose.Schema({
  type: { // 'assignment' or 'quiz'
    type: String,
    enum: ['assignment', 'quiz'],
    required: true
  },
  refId: { // assignmentId or quizId
    type: mongoose.Schema.Types.ObjectId,
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
  grade: {
    type: Number,
    required: true
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Grades', GradesSchema);