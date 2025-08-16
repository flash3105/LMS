const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const Course = require('../models/Course');

// Ensure resources directory exists
const resourcesDir = path.join(__dirname, '..', 'uploads', 'resources');

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resourcesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFileName);
  }
});

const upload = multer({ storage: storage });

// POST /api/courses/:courseId/resources
// POST /api/courses/:courseId/resources
router.post('/courses/:courseId/resources', upload.single('file'), async (req, res) => {
  try {
    const { title, type, description, link, folder } = req.body; // <-- include folder
    const { courseId } = req.params;

    if (type !== 'link' && !req.file) {
      return res.status(400).json({ error: 'File is required for non-link resources.' });
    }
    if (type === 'link' && (!link || link.trim() === '')) {
      return res.status(400).json({ error: 'Link is required for external resources.' });
    }

    let filePath = type === 'link' ? link : null;
    let originalName = null;

    if (req.file) {
      filePath = path.relative(
        path.join(__dirname, '..'),
        req.file.path
      ).replace(/\\/g, '/');
      originalName = req.file.originalname;
    }

    const resource = new Resource({
      title,
      type,
      description,
      course: courseId,
      folder: folder || "General", // <-- store folder (default if none provided)
      filePath,
      originalName,
      link: type === 'link' ? link : undefined,
      createdAt: new Date()
    });

    await resource.save();
    await Course.findByIdAndUpdate(courseId, { $push: { resources: resource._id } });

    res.status(201).json({
      message: 'Resource added successfully',
      resource: {
        id: resource._id,
        title: resource.title,
        type: resource.type,
        folder: resource.folder, // include folder in response
        filePath: resource.filePath,
        downloadUrl: resource.type !== 'link' ? `/api/resources/file/${path.basename(resource.filePath)}` : null,
        link: resource.link
      }
    });
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// GET /api/resources/file/:filename
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(resourcesDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the original filename from the database if available
    Resource.findOne({ filePath: { $regex: filename } })
      .then(resource => {
        const originalFileName = resource?.originalName || filename;
        
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

// GET /api/courses/:courseId/resources
router.get('/courses/:courseId/resources', async (req, res) => {
  try {
    const { courseId } = req.params;
    const resources = await Resource.find({ course: courseId });
    
    // Add download URLs to file resources
    const resourcesWithUrls = resources.map(resource => ({
      ...resource.toObject(),
      downloadUrl: resource.type !== 'link' ? `/api/resources/file/${path.basename(resource.filePath)}` : null
    }));

    console.log(`Fetched ${resources.length} resources for course ${courseId}`);
    res.status(200).json(resourcesWithUrls);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// DELETE /api/resources/:resourceId
router.delete('/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Remove file from disk if not a link
    if (resource.type !== 'link' && resource.filePath) {
      const absolutePath = path.join(__dirname, '..', resource.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    // Remove from course's resources array
    await Course.findByIdAndUpdate(resource.course, { $pull: { resources: resource._id } });

    // Delete resource from DB
    await Resource.findByIdAndDelete(req.params.resourceId);

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// PATCH /api/resources/:resourceId/folder
router.patch('/:resourceId/folder', async (req, res) => {
  try {
    const { folder } = req.body;

    if (!folder || folder.trim() === "") {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { folder },
      { new: true } // return updated resource
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.status(200).json({
      message: 'Folder updated successfully',
      resource
    });
  } catch (err) {
    console.error('Error updating folder:', err);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});


module.exports = router;