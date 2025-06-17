const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  title: String,
  certificateUrl: String, // Link to certificate file or image
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  achievements: [AchievementSchema],
  milestones: [MilestoneSchema],
  goals: [GoalSchema],
});

module.exports = mongoose.model("Profile", ProfileSchema);