const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assessment = require('../models/Assessment');
const Course = require('../models/Course');

// Ensure upload directory exists
const uploadDir = 'uploads/assessments';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route: Add a new assessment to a course
router.post('/courses/:courseId/assessments', upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const { courseId } = req.params;

    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required.' });
    }

    // Create assessment document
    const assessment = new Assessment({
      course: courseId,
      title,
      description,
      dueDate,
      filePath: req.file ? req.file.path : undefined,
      originalName: req.file ? req.file.originalname : undefined
    });
    await assessment.save();

    // Optionally, add assessment to course's assessments array
    // await Course.findByIdAndUpdate(courseId, { $push: { assessments: assessment._id } });

    res.status(201).json({ message: 'Assessment created successfully', assessment });
  } catch (error) {
    console.error('Error adding assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get all assessments for a course
router.get('/courses/:courseId/assessments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await Assessment.find({ course: courseId });
    res.status(200).json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Download an assessment file
router.get('/assessments/:assessmentId/download', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment || !assessment.filePath) return res.status(404).json({ message: 'File not found' });
    res.download(assessment.filePath, assessment.originalName);
  } catch (error) {
    console.error('Error downloading assessment file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;