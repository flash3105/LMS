const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Set to true if you want to require user tracking
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false
  },
  action: {
    type: String,
    required: true
  },
  resourceTitle: String,
  resourceUrl: String,
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },
  grade: Number,
  seconds: Number, // For time_spent
  meta: mongoose.Schema.Types.Mixed, // For any extra data
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);