const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true, // Email or name of the sender
  },
  recipient: {
    type: String,
    required: true, // Email of the recipient
  },
  subject: {
    type: String,
    required: true, // Subject of the message
  },
  content: {
    type: String,
    required: true, // Message content
  },
  date: {
    type: Date,
    default: Date.now, // Date when the message was sent
  },
});

module.exports = mongoose.model('Message', MessageSchema);