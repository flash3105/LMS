const mongoose = require('mongoose');

// Define the Course schema
const CourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  authorEmail: { type: String, required: true },
  courseDescription: { type: String, required: true },
  visibility: { type: String, enum: ['public', 'private'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the Course model
module.exports = mongoose.model('Course', CourseSchema);