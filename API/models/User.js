const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { 
    type: String, 
    enum: ['Intern', 'Instructor', 'Admin'], 
    default: 'Intern' 
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    required: true,
  },
  resetPasswordToken: {
    type: String,
    select: false // Hide from queries by default
  },
  resetPasswordExpires: {
    type: Date,
    select: false 
  }
}, { timestamps: true }); // timestamps for better tracking

module.exports = mongoose.model("User", UserSchema);
