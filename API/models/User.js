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
    enum: ['Student', 'Instructor', 'Admin'], 
    default: 'Student' 
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
});

module.exports = mongoose.model("User", UserSchema);
