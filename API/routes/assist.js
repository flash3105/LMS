const express = require("express");
const router = express.Router();
const Assist = require("../models/Assist");
const User = require("../models/User"); // Import your User model
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// --- Auth middleware ---
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, "mysecretkey"); // use your login secret
    req.user = decoded; // attach payload (id, role) to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// --- Nodemailer setup ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional admin check
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
}

// --- POST /api/assist: create new assist request ---
router.post("/", authMiddleware, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message)
    return res.status(400).json({ error: "Subject and message required" });

  try {
    // Fetch full user info to get email
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ error: "User not found" });

    const newRequest = new Assist({
      user: user._id,
      subject,
      message,
    });

    await newRequest.save();

    // Send notification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      subject: `New Assist Request: ${subject}`,
      html: `
        <h3>New Assist Request Received</h3>
        <p><strong>User ID:</strong> ${user._id}</p>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Error sending email:", err);
      else console.log("Support request email sent:", info.response);
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
