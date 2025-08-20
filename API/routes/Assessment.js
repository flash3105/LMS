const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assessment = require('../models/Assessment');
const Course = require('../models/Course');

// Ensure upload directory exists
const uploadDir = 'uploads/assessments';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { courseId } = req.params;
    const { folder } = req.body;
    
    // Create course-specific directory if it doesn't exist
    const courseDir = path.join(uploadDir, courseId);
    if (!fs.existsSync(courseDir)) {
      fs.mkdirSync(courseDir, { recursive: true });
    }
    
    // Create folder directory if specified
    if (folder && folder.trim() !== '') {
      const folderDir = path.join(courseDir, folder);
      if (!fs.existsSync(folderDir)) {
        fs.mkdirSync(folderDir, { recursive: true });
      }
      cb(null, folderDir);
    } else {
      cb(null, courseDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFileName);
  }
});
const upload = multer({ storage: storage });

// Route: Add a new assessment to a course
router.post('/courses/:courseId/assessments', upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate, points, status, folder } = req.body;
    const { courseId } = req.params;

    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required.' });
    }

    let filePath = null;
    let originalName = null;
    
    if (req.file) {
      filePath = path.relative(
        path.join(__dirname, '..'),
        req.file.path
      ).replace(/\\/g, '/');
      originalName = req.file.originalname;
    }

    // Create assessment document
    const assessment = new Assessment({
      course: courseId,
      title,
      description,
      dueDate,
      points: points || 0,
      status: status || 'pending',
      folder: folder || "General",
      filePath,
      originalName
    });
    await assessment.save();

    // Add assessment to course
    await Course.findByIdAndUpdate(courseId, { $push: { assessments: assessment._id } });

    res.status(201).json({ 
      message: 'Assessment created successfully', 
      assessment: {
        ...assessment.toObject(),
        downloadUrl: filePath ? `/api/assessments/${assessment._id}/download` : null
      }
    });
  } catch (error) {
    console.error('Error adding assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get all assessments for a course with folder structure
router.get('/courses/:courseId/assessments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await Assessment.find({ course: courseId });
    
    // Group assessments by folder
    const assessmentsByFolder = {};
    assessments.forEach(assessment => {
      const folder = assessment.folder || "General";
      if (!assessmentsByFolder[folder]) {
        assessmentsByFolder[folder] = [];
      }
      
      assessmentsByFolder[folder].push({
        ...assessment.toObject(),
        downloadUrl: assessment.filePath ? `/api/assessments/${assessment._id}/download` : null
      });
    });

    res.status(200).json(assessmentsByFolder);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get all assessments (for all courses) - flattened
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await Assessment.find({});
    const flattenedAssessments = assessments.map(assessment => ({
      ...assessment.toObject(),
      downloadUrl: assessment.filePath ? `/api/assessments/${assessment._id}/download` : null
    }));
    
    res.status(200).json(flattenedAssessments);
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get the total number of assessments
router.get('/assessments/count', async (req, res) => {
  try {
    const totalAssessments = await Assessment.countDocuments();
    res.status(200).json({ totalAssessments });
  } catch (error) {
    console.error('Error counting assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Download an assessment file
router.get('/assessments/:assessmentId/download', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    if (!assessment || !assessment.filePath) return res.status(404).json({ message: 'File not found' });
    
    const absolutePath = path.join(__dirname, '..', assessment.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(absolutePath, assessment.originalName || 'assessment_file');
  } catch (error) {
    console.error('Error downloading assessment file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Update assessment folder
router.patch('/assessments/:assessmentId/folder', async (req, res) => {
  try {
    const { folder } = req.body;

    if (!folder || folder.trim() === "") {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const assessment = await Assessment.findByIdAndUpdate(
      req.params.assessmentId,
      { folder },
      { new: true }
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json({
      message: 'Folder updated successfully',
      assessment
    });
  } catch (err) {
    console.error('Error updating folder:', err);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

module.exports = router;