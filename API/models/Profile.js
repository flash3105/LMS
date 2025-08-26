const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  title: String,
  certificateUrl: String,
  issuedBy: String,
  date: Date,
});

const CertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true },
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseName: { type: String, required: true },
  grade: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  completionDate: { type: Date, required: true },
  certificateUrl: { type: String },
  status: { type: String, enum: ['enrolled', 'completed'], default: 'enrolled' }
});
const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  achievedOn: Date,
});


const SubtaskSchema = new mongoose.Schema({
  description: { type: String, required: true }, 
  dueDate: { type: Date },                       
  completed: { type: Boolean, default: false },
});

// Extended Goal schema
const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  targetDate: Date,

  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started",
  },
  subtasks: [SubtaskSchema], 
  progress: { type: Number, default: 0 }, 
  completed: { type: Boolean, default: false }, 
});

const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  certificates: [CertificateSchema],
  achievements: [AchievementSchema],
  milestones: [MilestoneSchema],
  goals: [GoalSchema],
});

module.exports = mongoose.model("Profile", ProfileSchema);
