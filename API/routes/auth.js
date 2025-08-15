const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path'); // Added for serving HTML files
const Profile = require('../models/Profile');

// Email transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'oarabilemokone23@gmail.com',
    pass: process.env.EMAIL_PASS || 'dwre geil kvhr pzki'
  }
});

async function registerUser(registrationData, contentArea) {
  try {
    // Step 1: Register user
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Registration failed');

    // Step 2: Fetch the newly created profile
    const profileRes = await fetch(`${API_BASE_URL}/Profile/${registrationData.email}`);
    const profile = await profileRes.json();

    // Step 3: Merge user and profile info
    const currentUser = {
      email: registrationData.email,
      name: registrationData.name,
      surname: registrationData.surname,
      role: registrationData.role,
      level: registrationData.level,
      bio: profile.bio,
      achievements: profile.achievements,
      milestones: profile.milestones,
      goals: profile.goals
    };

    // Step 4: Render profile tab with all data
    renderProfileTab(contentArea, currentUser);

  } catch (error) {
    console.error('Registration error:', error);
    alert(error.message || 'Registration failed');
  }
}


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'mysecretkey', { expiresIn: '1h' });

    const Profile = require('../models/Profile');
    let profile = await Profile.findOne({ email });
    if (!profile) {
      // this is optional; usually registration ensures profile exists
      profile = await Profile.create({
        email,
        bio: '',
        achievements: [],
        milestones: [],
        goals: []
      });
    }

    const fullUser = {
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      level: user.level,
      bio: profile.bio,
      achievements: profile.achievements,
      milestones: profile.milestones,
      goals: profile.goals
    };

    res.json({ token, user: fullUser });

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