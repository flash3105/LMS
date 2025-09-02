const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const ResourceCompletion = require('../models/ResourceCompletion');
const ResourceRating = require('../models/ResourceRating');


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
    console.log("resource created");
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

// GET single resource - will handle /api/resources/:resourceId
router.get('/resources/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({
      ...resource.toObject(),
      downloadUrl: resource.type !== 'link' 
        ? `/api/resources/file/${path.basename(resource.filePath)}` 
        : null
    });
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Failed to fetch resource' });
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
router.delete('/resources/:resourceId', async (req, res) => {
  try {
    console.log("DELETE request for:", req.params.resourceId);
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

// GET /api/resources/:resourceId
router.get('/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({
      ...resource.toObject(),
      downloadUrl: resource.type !== 'link' ? `/api/resources/file/${path.basename(resource.filePath)}` : null
    });
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// PUT /api/resources/:resourceId
router.put('/resources/:resourceId', upload.single('file'), async (req, res) => {
  try {
    const { title, type, description, link, folder } = req.body;
    const resourceId = req.params.resourceId;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    console.log("updated");
    // Update fields
    resource.title = title;
    resource.type = type;
    resource.description = description;
    resource.folder = folder || "General";
    
    if (type === 'link') {
      resource.link = link;
      // Remove file if changing from file to link
      if (resource.filePath) {
        const absolutePath = path.join(__dirname, '..', resource.filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
        resource.filePath = null;
        resource.originalName = null;
      }
    } else if (req.file) {
      // If new file uploaded
      if (resource.filePath) {
        // Remove old file
        const oldPath = path.join(__dirname, '..', resource.filePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      resource.filePath = path.relative(
        path.join(__dirname, '..'),
        req.file.path
      ).replace(/\\/g, '/');
      resource.originalName = req.file.originalname;
      resource.link = undefined;
    }

    await resource.save();

    res.status(200).json({
      message: 'Resource updated successfully',
      resource: {
        id: resource._id,
        title: resource.title,
        type: resource.type,
        folder: resource.folder,
        filePath: resource.filePath,
        downloadUrl: resource.type !== 'link' ? `/api/resources/file/${path.basename(resource.filePath)}` : null,
        link: resource.link
      }
    });
  } catch (error) {
    console.error('Resource update error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

router.patch('/resources/:resourceId/mark-played', async (req, res) => {
  try {
    const { email } = req.body; // email of the user who played
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    if (!resource.playedBy.includes(email)) {
      resource.playedBy.push(email);
      await resource.save();
    }

    res.status(200).json({ message: 'Resource marked as played', playedBy: resource.playedBy });
  } catch (err) {
    console.error('Error marking resource as played:', err);
    res.status(500).json({ error: 'Failed to mark as played' });
  }
});

//Route for marking a resource as complete
router.patch('/resources/:resourceId/complete', async (req, res) => {
  try {
    const { userId } = req.body; // in real app, take from auth middleware
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await ResourceCompletion.updateOne(
      { user: userId, resource: req.params.resourceId },
      { $setOnInsert: { completedAt: new Date() } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Resource marked as complete' });
  } catch (err) {
    console.error('Error marking complete:', err);
    res.status(500).json({ error: 'Failed to mark resource as complete' });
  }
});

//Route for rating a resource
router.post('/resources/:resourceId/rating', async (req, res) => {
  try {
    const { userId, user, rating, feedback } = req.body;
    const finalUserId = userId || user;

    if (!finalUserId || rating == null) { // allow 0 check
      return res.status(400).json({ error: 'User ID and rating are required' });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const savedRating = await ResourceRating.findOneAndUpdate(
      { user: finalUserId, resource: req.params.resourceId },
      { rating: numericRating, feedback, ratedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Rating saved', rating: savedRating });
  } catch (err) {
    console.error('Error saving rating:', err);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});


//Route for getting resource completions
router.get('/resources/completions/:userId', async (req, res) => {
  try {
    const completions = await ResourceCompletion.find({ user: req.params.userId });
    res.status(200).json(completions);
  } catch (err) {
    console.error('Error fetching completions:', err);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
});

//Route for getting resource ratings
router.get('/resources/ratings/:userId', async (req, res) => {
  try {
    const ratings = await ResourceRating.find({ user: req.params.userId });
    res.status(200).json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

//Mark a resource as uncomplete
router.patch('/resources/:resourceId/uncomplete', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await ResourceCompletion.deleteOne({ user: userId, resource: req.params.resourceId });

    res.status(200).json({ message: 'Resource marked as uncomplete' });
  } catch (err) {
    console.error('Error uncompleting resource:', err);
    res.status(500).json({ error: 'Failed to uncomplete resource' });
  }
});

// Delete user rating for a resource
router.delete('/resources/:resourceId/rating', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    await ResourceRating.deleteOne({ user: userId, resource: req.params.resourceId });
    res.status(200).json({ message: 'Rating deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});


module.exports = router;