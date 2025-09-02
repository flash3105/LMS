const express = require('express');
const router = express.Router();
const multer = require('multer');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const bucket = require('../config/gcs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Upload a file to Google Cloud Storage.
 *
 * @param {Object} file Multer file object.
 * @returns {Promise} Promise that resolves with the file path.
 */
async function uploadToGCS(file) {
  const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob = bucket.file(`resources/${uniqueName}`);
  const stream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      // Don't try to make public - just resolve with the filePath
      resolve({
        filePath: uniqueName,
      });
    });
    stream.on('error', reject);
    stream.end(file.buffer);
  });
}

async function getSignedUrl(filePath) {
  if (!filePath) return null;

  const file = bucket.file(`resources/${filePath}`);
  const [exists] = await file.exists();
  if (!exists) {
    console.log('File not found in bucket:', filePath);
    return null;
  }

  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const [url] = await file.getSignedUrl(options);
  return url;
}


// Helper to delete file from GCS
async function deleteFromGCS(filePath) {
  try {
    const file = bucket.file(`resources/${filePath}`);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      console.log(`File ${filePath} deleted from GCS`);
    }
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
  }
}

// POST /api/courses/:courseId/resources
router.post('/courses/:courseId/resources', upload.single('file'), async (req, res) => {
 
  try {
    const { title, type, description, link, folder } = req.body;
    const { courseId } = req.params;

    if (type !== 'link' && !req.file) {
      return res.status(400).json({ error: 'File is required for non-link resources.' });
    }
    if (type === 'link' && (!link || link.trim() === '')) {
      return res.status(400).json({ error: 'Link is required for external resources.' });
    }

    let filePath = null;
    let originalName = null;

    // Upload file to GCS if it's a file resource
    if (req.file) {
      try {
        const uploadResult = await uploadToGCS(req.file);
        filePath = uploadResult.filePath;
        originalName = req.file.originalname;
      } catch (uploadError) {
        console.error('GCS upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file to storage' });
      }
    }

    const resource = new Resource({
      title,
      type,
      description,
      course: courseId,
      folder: folder || "General",
      filePath: type === 'link' ? link : filePath, // Store filePath for GCS files
      filePath: filePath,
      originalName,
      link: type === 'link' ? link : undefined,
      createdAt: new Date()
    });

    await resource.save();
    await Course.findByIdAndUpdate(courseId, { $push: { resources: resource._id } });
    
    // Generate signed URL for the uploaded file
    let downloadUrl = null;
    if (resource.type !== 'link' && resource.filePath) {
      downloadUrl = await getSignedUrl(resource.filePath);
    }
    
    res.status(201).json({
      message: 'Resource added successfully',
      resource: {
        id: resource._id,
        title: resource.title,
        type: resource.type,
        folder: resource.folder,
        filePath: resource.filePath,
        downloadUrl,
        link: resource.link
      }
    });
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// GET /api/courses/:courseId/resources
router.get('/courses/:courseId/resources', async (req, res) => {
  try {
    const { courseId } = req.params;
    const resources = await Resource.find({ course: courseId });
    
    // Generate signed URLs for all file resources
    const resourcesWithUrls = await Promise.all(
      resources.map(async resource => {
        let downloadUrl = null;
        if (resource.type !== 'link' && resource.filePath) {
          downloadUrl = await getSignedUrl(resource.filePath);
        }
        return {
          ...resource.toObject(),
          downloadUrl
        };
      })
    );

    
    res.status(200).json(resourcesWithUrls);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET single resource - will handle /api/resources/:resourceId
router.get('/resources/:resourceId', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    let downloadUrl = null;
    if (resource.type !== 'link' && resource.filePath) {
      downloadUrl = await getSignedUrl(resource.filePath);
    }
    
    res.status(200).json({
      ...resource.toObject(),
      downloadUrl
    });
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Failed to fetch resource' });
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

    // Remove file from GCS if not a link and has a filePath
    if (resource.type !== 'link' && resource.filePath) {
      await deleteFromGCS(resource.filePath);
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
router.patch('/resources/:resourceId/folder', async (req, res) => {
  try {
    const { folder } = req.body;

    if (!folder || folder.trim() === "") {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { folder },
      { new: true }
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

// PUT /api/resources/:resourceId
router.put('/resources/:resourceId', upload.single('file'), async (req, res) => {
  try {
    const { title, type, description, link, folder } = req.body;
    const resourceId = req.params.resourceId;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Update fields
    resource.title = title;
    resource.type = type;
    resource.description = description;
    resource.folder = folder || "General";

    if (type === 'link') {
      // Remove file from GCS if changing from file to link
      if (resource.filePath) {
        await deleteFromGCS(resource.filePath);
        resource.filePath = null;
        resource.originalName = null;
      }
      resource.filePath = link;
      resource.link = link;
    } else if (req.file) {
      // If new file uploaded
      // Remove old file from GCS if exists
      if (resource.filePath) {
        await deleteFromGCS(resource.filePath);
      }

      // Upload new file to GCS
      try {
        const uploadResult = await uploadToGCS(req.file);
        resource.filePath = uploadResult.filePath;
        resource.filePath = uploadResult.filePath;
        resource.originalName = req.file.originalname;
        resource.link = undefined;
      } catch (uploadError) {
        console.error('GCS upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file to storage' });
      }
    }

    await resource.save();

    // Generate signed URL if resource is a file
    let downloadUrl = null;
    if (resource.type !== 'link' && resource.filePath) {
      downloadUrl = await getSignedUrl(resource.filePath);
    }

    res.status(200).json({
      message: 'Resource updated successfully',
      resource: {
        id: resource._id,
        title: resource.title,
        type: resource.type,
        folder: resource.folder,
        filePath: resource.filePath,
        downloadUrl,
        link: resource.link
      }
    });
  } catch (error) {
    console.error('Resource update error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

module.exports = router;