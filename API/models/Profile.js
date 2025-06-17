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
});

const GoalSchema = new mongoose.Schema({
  title: String,
  description: String,
  targetDate: Date,
  completed: { type: Boolean, default: false },
});

const ProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Use email as unique ID
  achievements: [AchievementSchema],
  milestones: [MilestoneSchema],
  goals: [GoalSchema],
});

module.exports = mongoose.model("Profile", ProfileSchema);