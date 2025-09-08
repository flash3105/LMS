const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
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
  grade: {
    type: Number,   
    min: 1,         
    max: 12,        
    required: function() {
      return this.role === 'Student';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resetPasswordToken: {
    type: String,
    select: false // Hide from queries by default
  },
  resetPasswordExpires: {
    type: Date,
    select: false 
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  }
}, { timestamps: true }); // timestamps for better tracking

module.exports = mongoose.model("User", UserSchema);
