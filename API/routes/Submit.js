const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bucket = require('../config/gcs');
const AssessmentSubmission = require('../models/Submit');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload file to GCS
async function uploadToGCS(file) {
  const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob = bucket.file(`submissions/${uniqueName}`);
  const stream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve({ filePath: uniqueName }));
    stream.on('error', reject);
    stream.end(file.buffer);
  });
}

// Generate signed URL
async function getSignedUrl(filePath) {
  if (!filePath) return null;
  const file = bucket.file(`submissions/${filePath}`);
  const [exists] = await file.exists();
  if (!exists) return null;

  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days
  };
  const [url] = await file.getSignedUrl(options);
  return url;
}

// POST submission
router.post('/assessments/:assessmentId/submit', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required.' });

    const { username, email, comment, courseId } = req.body;
    if (!username || !email || !courseId) return res.status(400).json({ error: 'Missing required fields' });

    // Upload to GCS
    const uploadResult = await uploadToGCS(req.file);

    const submission = new AssessmentSubmission({
      assessmentId: req.params.assessmentId,
      courseId,
      username,
      email,
      comment: comment || '',
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: uploadResult.filePath,
      submittedAt: new Date()
    });

    await submission.save();

    // Generate download URL
    const downloadUrl = await getSignedUrl(submission.filePath);

    res.status(201).json({
      message: 'Submission successful',
      submission: {
        id: submission._id,
        downloadUrl,
        ...submission.toObject()
      }
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// GET submission by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const submissions = await AssessmentSubmission.find({ courseId });

    const submissionsWithUrls = await Promise.all(submissions.map(async sub => ({
      ...sub.toObject(),
      downloadUrl: await getSignedUrl(sub.filePath)
    })));

    res.status(200).json(submissionsWithUrls);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET submissions by course and student
router.get('/course/:courseId/:email', async (req, res) => {
  try {
    const { courseId, email } = req.params;
    const submissions = await AssessmentSubmission.find({ courseId, email });

    const submissionsWithUrls = await Promise.all(submissions.map(async sub => ({
      ...sub.toObject(),
      downloadUrl: await getSignedUrl(sub.filePath)
    })));

    res.status(200).json(submissionsWithUrls);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// PUT grade & feedback
router.put('/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade == null) return res.status(400).json({ error: 'Grade is required' });

    const updated = await AssessmentSubmission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Submission not found' });

    const downloadUrl = await getSignedUrl(updated.filePath);

    res.status(200).json({ message: 'Grade and feedback updated successfully', updated: { ...updated.toObject(), downloadUrl } });
  } catch (err) {
    console.error('Error updating grade and feedback:', err);
    res.status(500).json({ error: 'Failed to update grade and feedback' });
  }
});

// GET all graded submissions for student
router.get('/graded/:email/all', async (req, res) => {
  try {
    const { email } = req.params;
    const submissions = await AssessmentSubmission.find({ email });

    const submissionsWithUrls = await Promise.all(submissions.map(async sub => ({
      ...sub.toObject(),
      downloadUrl: await getSignedUrl(sub.filePath)
    })));

    res.status(200).json(submissionsWithUrls);
  } catch (err) {
    console.error('Error fetching student submissions:', err);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
});

module.exports = router;
