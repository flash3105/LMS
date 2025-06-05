const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Resource = require('../models/Resource'); // Make sure you have this model
const Course = require('../models/Course');     // For associating resources with courses
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/resources';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the defined upload directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route: Add a new resource to a course
router.post('/courses/:courseId/resources', upload.single('file'), async (req, res) => {
  try {
    const { title, type, description, link } = req.body;
    const { courseId } = req.params;

    // If type is not 'link', require a file
    if (type !== 'link' && !req.file) {
      return res.status(400).json({ message: 'File is required.' });
    }
    // If type is 'link', require a link
    if (type === 'link' && (!link || link.trim() === '')) {
      return res.status(400).json({ message: 'Link is required for external link resources.' });
    }

    // Create resource document
    const resourceData = {
      title,
      type,
      description,
      course: courseId
    };

    if (type === 'link') {
      resourceData.link = link;
      resourceData.filePath = link; // Save the link as filePath for consistency
    } else {
      resourceData.filePath = req.file.path;
      resourceData.originalName = req.file.originalname;
    }

    const resource = new Resource(resourceData);
    await resource.save();

    // Optionally, add resource to course's resources array
    await Course.findByIdAndUpdate(courseId, { $push: { resources: resource._id } });

    res.status(201).json({ message: 'Resource added successfully', resource });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Get all resources for a course
router.get('/courses/:courseId/resources', async (req, res) => {
  try {
    const { courseId } = req.params;
    // Select all fields, including 'link'
    const resources = await Resource.find({ course: courseId }).select('-__v');
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Download a resource file
router.get('/resources/:resourceId/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.download(resource.filePath, resource.originalName);
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route: Delete a resource
router.delete('/resources/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Remove file from disk if not a link
    if (resource.type !== 'link' && resource.filePath && fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath);
    }

    // Remove from course's resources array
    await Course.findByIdAndUpdate(resource.course, { $pull: { resources: resource._id } });

    // Delete resource from DB
    await Resource.findByIdAndDelete(req.params.resourceId);

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;