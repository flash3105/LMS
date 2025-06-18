const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Route: Send a message
router.post('/send', async (req, res) => {
  try {
    const { sender, recipient, subject, content } = req.body;

    // Validate required fields
    if (!sender || !recipient || !subject || !content) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create and save the message
    const message = new Message({ sender, recipient, subject, content });
    await message.save();

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get all messages for a recipient
router.get('/receive/:recipient', async (req, res) => {
  try {
    const { recipient } = req.params;

    // Find all messages for the recipient
    const messages = await Message.find({ recipient }).sort({ date: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/sent/:sender', async (req, res) => {
  try {
    const { sender } = req.params;
    const messages = await Message.find({ sender }).sort({ date: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;