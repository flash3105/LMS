const express = require('express');
const router = express.Router();
const Todo = require('../models/todos');

// Add a new to-do for a user (by email)
router.post('/todos/:email', async (req, res) => {
  try {
    const todo = new Todo({ ...req.body, email: req.params.email });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all to-dos for a user (by email)
router.get('/todos/:email', async (req, res) => {
  try {
    const todos = await Todo.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update status of a to-do by ID
router.patch('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a to-do by ID
router.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;