const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  task: {
    type: String,
    required: true
  },
  assignee: String,
  dueDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['on-track', 'at-risk', 'done'],
    default: 'on-track'
  },
  course: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Todo', TodoSchema);