const mongoose = require("mongoose");

const GradePerLearnerSchema = new mongoose.Schema({
  learnerEmail: { type: String, required: true },
  learnerName: { type: String },
  averageGrade: { type: Number, default: 0 },
  grades: [{
    assessmentTitle: String,
    grade: Number,
    feedback: String
  }]
});

const GradesPerCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  courseName: { type: String },
  learners: [GradePerLearnerSchema]
});

const StatisticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true },
  gradesPerCourse: [GradesPerCourseSchema],
  totalUsers: { type: Number, default: 0 },
  totalCourses: { type: Number, default: 0 },
  totalAssessments: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 }, // e.g., users active in the last 24h
  newUsers: { type: Number, default: 0 },   // e.g., users registered today
  newCourses: { type: Number, default: 0 }, // e.g., courses created today
  // Add more fields as needed for your admin dashboard
});

module.exports = mongoose.model("Statistics", StatisticsSchema);