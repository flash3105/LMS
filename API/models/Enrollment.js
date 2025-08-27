const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'MyCourses', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['enrolled', 'in progress', 'completed'], 
    default: 'enrolled' 
  },
  progress: { type: Number, default: 0 },
  milestones: {
    term1: { type: Boolean, default: false },
    term2: { type: Boolean, default: false },
    term3: { type: Boolean, default: false },
    term4: { type: Boolean, default: false }
  },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  certificateId: { type: String }, // for certificates
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
