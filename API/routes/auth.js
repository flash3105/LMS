const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const { email, password, role,name, surname, level} = req.body;

  console.log('Received registration request:', req.body); // Log only

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ email, password: hashedPassword, role,name,surname, level });
    await user.save();

    res.json({ message: 'User registered successfully', token: 'mock-token' }); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received login request:', req.body); // Log only
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'mysecretkey', { expiresIn: '1h' });

    // Send user info along with the token

    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
});

// Route: Get total registered users and their emails
router.get('/registered-users', async (req, res) => {
  try {
const users = await User.find({}, 'email name role'); 
 // Fetch all users
    const totalUsers = users.length;

    res.status(200).json({
      totalUsers,
      users: users.map(user => ({
        email: user.email,
        name: user.name || 'N/A',
        role: user.role || 'N/A'
      }))
    });
  } catch (error) {
    console.error('Error fetching registered users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
