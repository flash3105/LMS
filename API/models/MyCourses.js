const mongoose = require('mongoose');

const MyCoursesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', // Reference to the Course model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MyCourses', MyCoursesSchema);