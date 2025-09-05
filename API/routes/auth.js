const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path'); // Added for serving HTML files
const Profile = require('../models/Profile');
const Institution = require('../models/Institution');


// Email transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'oarabilemokone23@gmail.com',
    pass: process.env.EMAIL_PASS || 'dwre geil kvhr pzki'
  }
});

// Register
router.post('/register', async (req, res) => {
  console.log('Full request body:', req.body);
  
  const { email, password, role, name, surname, level, institution } = req.body;
  
  if (!institution) {
    console.error('Missing institution field');
    return res.status(400).json({ error: 'Institution is required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ email, password: hashedPassword, role, name, surname, level, institution });
    await user.save();

    res.json({ message: 'User registered successfully', token: 'mock-token' }); 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
});

router.get('/institutions', async (req, res) => {
    try {
        const institutions = await Institution.find({}, '_id institutionName');
        res.json(institutions);
    } catch (err) {
        console.error('Error fetching institutions:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Ensure profile exists
    let profile = await Profile.findOne({ email: user.email });
    if (!profile) {
      profile = await Profile.create({ email: user.email, bio: '' });
    }

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
        bio: profile.bio,
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
    const users = await User.find({}, '_id email name role'); 
    // Fetch all users
    const totalUsers = users.length;

    res.status(200).json({
      totalUsers,
      users: users.map(user => ({
        _id: user._id,
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user doesn't exist
      return res.status(200).json({ message: 'If this email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 1800000; // Valid for 30 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${req.headers.origin}/UI/Login/ForgotPassword.html?token=${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You requested a password reset. Click this link to proceed:\n\n${resetUrl}\n\nThis link expires in 30 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reset link sent' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

// Serve the reset password page (GET request)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Check if token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Return JSON for API calls
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
      
      // Return HTML for direct browser access
      return res.status(400).send(`
        <html>
          <body>
            <h1>Invalid Token</h1>
            <p>This password reset link is invalid or expired.</p>
            <a href="/forgot-password">Request a new link</a>
          </body>
        </html>
      `);
    }

    // Return JSON for API calls
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ valid: true, email: user.email });
    }

    // Serve the HTML page for direct browser access
    res.sendFile(path.join(__dirname, '../../UI/Login/ForgotPassword.html'));
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;