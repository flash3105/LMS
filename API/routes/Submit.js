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
    cb(null, submissionsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFileName);
  }
});

const upload = multer({ storage: storage });

// POST /api/assessments/:assessmentId/submit
router.post('/assessments/:assessmentId/submit', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const { username, email, comment, courseId } = req.body;
    
    if (!username || !email || !courseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert absolute path to relative path
    const relativePath = path.relative(
      path.join(__dirname, '..'), // Base directory (project root)
      req.file.path              // Full absolute path
    ).replace(/\\/g, '/');      // Normalize to forward slashes

    const submission = new AssessmentSubmission({
      assessmentId: req.params.assessmentId,
      courseId,
      username,
      email,
      comment: comment || '',
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: relativePath, // Store relative path
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({
      message: 'Submission successful',
      submission: {
        id: submission._id,
        filePath: submission.filePath, // Verify this is relative
        // ... other fields
      }
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// GET /api/submissions/file/:filename
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(submissionsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the original filename from the database if available
    AssessmentSubmission.findOne({ fileName: filename })
      .then(submission => {
        const originalFileName = submission?.originalFileName || filename;
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (err) => {
          console.error('File stream error:', err);
          res.status(500).json({ error: 'Error streaming file' });
        });
      })
      .catch(err => {
        console.error('Database lookup error:', err);
        // Fallback if database lookup fails
        res.download(filePath, err => {
          if (err) {
            console.error('Error downloading file:', err);
            res.status(500).json({ error: 'Failed to download file' });
          }
        });
      });
  } catch (err) {
    console.error('Error serving file:', err);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const submissions = await AssessmentSubmission.find({ courseId });
    
    // Add download URLs to each submission
    const submissionsWithUrls = submissions.map(sub => ({
      ...sub.toObject(),
      downloadUrl: `/api/submissions/file/${sub.fileName}`
    }));

    console.log('Fetched submissions for course:', courseId, 'Count:', submissions.length);
    res.status(200).json(submissionsWithUrls);
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

// GET /api/submissions/graded/:email/all
router.get('/graded/:email/all', async (req, res) => {
  try {
    const { email } = req.params;

    const submissions = await AssessmentSubmission.find({ email });

    // Add download URLs to each submission
    const submissionsWithUrls = submissions.map(sub => ({
      ...sub.toObject(),
      downloadUrl: `/api/submissions/file/${sub.fileName}`
    }));

    console.log(`Fetched ${submissions.length} submissions for student ${email}`);
    res.status(200).json(submissionsWithUrls);
  } catch (err) {
    console.error('Error fetching student submissions:', err);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
});

module.exports = router;