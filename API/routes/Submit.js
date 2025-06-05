const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AssessmentSubmission = require('../models/Submit');

// Ensure submissions directory exists
const submissionsDir = path.join(__dirname, '..', 'uploads', 'submissions');
if (!fs.existsSync(submissionsDir)) {
  fs.mkdirSync(submissionsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/submissions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST /api/assessments/:assessmentId/submit
router.post('/assessments/:assessmentId/submit', upload.single('file'), async (req, res) => {
  try {
    const {
      username,
      email,
      comment,
      courseId,
      submittedAt
    } = req.body;

    const filePath = req.file ? req.file.path : null;
    const originalFileName = req.file ? req.file.originalname : null;

    if (!filePath) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const submission = new AssessmentSubmission({
      assessmentId: req.params.assessmentId,
      courseId,
      username,
      email,
      comment,
      filePath,
      originalFileName,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date()
    });

    await submission.save();

    res.status(201).json({ message: 'Submission successful', submission });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;