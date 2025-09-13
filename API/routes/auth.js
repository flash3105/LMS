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

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'mysecretkey'); // same key used in login
    req.user = decoded; // attach payload (id, role) to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Register
router.post('/register', async (req, res) => {
  console.log('Full request body:', req.body);
  
  const { email, password, role, name, surname, idNumber, grade, institution } = req.body;
  
  if (!institution) {
    console.error('Missing institution field');
    return res.status(400).json({ error: 'Institution is required' });
  }

  try {
    // Check if user already exists by email
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    
    // Check if ID number already exists
    let idExists = await User.findOne({ idNumber });
    if (idExists) return res.status(400).json({ error: 'ID number already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user with data:', { 
      email, name, surname, idNumber, role, grade, institution 
    });

    user = new User({ 
      email, 
      password: hashedPassword, 
      role, 
      name, 
      surname, 
      idNumber, 
      grade, 
      institution, 
      status: 'pending' 
    });
    await user.save();

    res.json({ message: 'User registered successfully. Please wait for approval.', token: 'mock-token' }); 
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
    let email = req.body.email;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.status !== 'approved') {
      return res.status(401).json({ error: 'Your account is pending approval. Please wait for administrator approval.' });
    }

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
        idNumber: user.idNumber,
        role: user.role,
        institution: user.institution,
        grade: user.grade,
        bio: profile.bio,
      },
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .populate('institution')
    
    res.json(pendingUsers);
  } catch (err) {
    console.error('Error fetching pending users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve user
router.put('/approve-user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('institution');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send approval email to the user
    try {
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER || 'thenetworkco3@gmail.com',
        subject: 'Your Account Has Been Approved!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
              .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 20px; padding: 20px; background: #eee; border-radius: 5px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Account Approved!</h1>
              </div>
              <div class="content">
                <p>Dear ${user.name} ${user.surname},</p>
                <p>We are pleased to inform you that your account has been approved by ${user.institution?.institutionName || 'your institution'}.</p>
                <p>You can now login to the iNurture LMS platform and start your learning journey!</p>
                
                <div style="text-align: center;">
                  <a href="${req.headers.origin}" class="button">Login to iNurture</a>
                </div>
                
                <p><strong>Login Details:</strong></p>
                <ul>
                  <li><strong>Email:</strong> ${user.email}</li>
                  <li><strong>Role:</strong> ${user.role}</li>
                  <li><strong>Institution:</strong> ${user.institution?.institutionName || 'N/A'}</li>
                </ul>
                
                <p>If you have any questions or need assistance, please contact your institution's administrator.</p>
                
                <p>Happy learning!<br>The iNurture Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} iNurture LMS. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Dear ${user.name} ${user.surname},

We are pleased to inform you that your account has been approved by ${user.institution?.institutionName || 'your institution'}.

You can now login to the iNurture LMS platform and start your learning journey!

Login Details:
- Email: ${user.email}
- Role: ${user.role}
- Institution: ${user.institution?.institutionName || 'N/A'}

Login URL: ${req.headers.origin}

If you have any questions or need assistance, please contact your institution's administrator.

Happy learning!
The iNurture Team`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Approval email sent to ${user.email}`);
      
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails, just log the error
    }
    
    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject user
router.put('/reject-user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('institution');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send rejection email to the user
    try {
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER || 'thenetworkco3@gmail.com',
        subject: 'Account Registration Update',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
              .footer { margin-top: 20px; padding: 20px; background: #eee; border-radius: 5px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Account Registration Update</h1>
              </div>
              <div class="content">
                <p>Dear ${user.name} ${user.surname},</p>
                <p>We regret to inform you that your account registration has been rejected by ${user.institution?.institutionName || 'your institution'}.</p>
                <p>If you believe this is an error, please contact your institution's administrator for more information.</p>
                
                <p>Thank you for your interest in iNurture LMS.</p>
                
                <p>Sincerely,<br>The iNurture Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} iNurture LMS. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Dear ${user.name} ${user.surname},

We regret to inform you that your account registration has been rejected by ${user.institution?.institutionName || 'your institution'}.

If you believe this is an error, please contact your institution's administrator for more information.

Thank you for your interest in iNurture LMS.

Sincerely,
The iNurture Team`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Rejection email sent to ${user.email}`);
      
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails, just log the error
    }
    
    res.json({ message: 'User rejected successfully', user });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({ error: 'Server error' });
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

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await Profile.findOne({ email: user.email });

    res.json({
      email: user.email,
      name: user.name,
      surname: user.surname,
      idNumber: user.idNumber,
      role: user.role,
      institution: user.institution,
      grade: user.grade,
      bio: profile ? profile.bio : '',
    });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;