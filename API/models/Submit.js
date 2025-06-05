const mongoose = require('mongoose');

const AssessmentSubmissionSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: { // Optionally store email for reference
    type: String
  },
  comment: {
    type: String
  },
  filePath: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: String,
    default: null
  },
  feedback: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('AssessmentSubmission', AssessmentSubmissionSchema);