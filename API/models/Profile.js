const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  title: String,
  certificateUrl: String,
  issuedBy: String,
  date: Date,
});

const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  achievedOn: Date,
  courseId: mongoose.Schema.Types.ObjectId, // Reference to course
  type: {
    type: String,
    enum: ['quiz', 'course', 'streak', 'other'],
    default: 'other'
  },
  score: Number, // score that triggers the milestone
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
  achievements: [AchievementSchema],
  milestones: [MilestoneSchema],
  goals: [GoalSchema],
});

module.exports = mongoose.model("Profile", ProfileSchema);
