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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, submissionsDir);  // Use absolute path here!
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
    console.error('Submission error:', err.stack || err);
    res.status(500).json({ error: 'Submission failed' });
  }
});



router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const submissions = await AssessmentSubmission.find({ courseId });
    console.log('Fetched submissions for course:', courseId, 'Count:', submissions.length);
    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

router.get('/course/:courseId/:email', async (req, res) => {
  try {
    const { courseId, email } = req.params;
    const submissions = await AssessmentSubmission.find({ 
      courseId, 
      email 
    });
    console.log(`Fetched submissions for course ${courseId} and user ${email}:`, submissions.length);
    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// PUT /api/submissions/:submissionId/grade
router.put('/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade == null) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    // Build update object dynamically
    const updateData = { grade };
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    const updated = await AssessmentSubmission.findByIdAndUpdate(
      submissionId,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json({ message: 'Grade and feedback updated successfully', updated });
  } catch (err) {
    console.error('Error updating grade and feedback:', err);
    res.status(500).json({ error: 'Failed to update grade and feedback' });
  }
});


// GET /api/submissions/:courseId/:email
router.get('/graded/:email/all', async (req, res) => {
  try {
    const { email } = req.params;

    const submissions = await AssessmentSubmission.find({
      email
    });

    console.log(`Fetched ${submissions.length} submissions for student ${email} `);

    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching student submissions:', err);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
});



module.exports = router;