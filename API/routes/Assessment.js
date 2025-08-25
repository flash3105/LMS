const express = require('express');
const router = express.Router();
const multer = require('multer');
const Assessment = require('../models/Assessment');
const bucket = require('../config/gcs');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload file to GCS
async function uploadToGCS(file) {
  try {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substring(2) + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = bucket.file(`assessments/${uniqueName}`);
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve({ filePath: uniqueName }));
      stream.on('error', reject);
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw error;
  }
}

// Generate signed URL for a file in GCS
async function getSignedUrl(filePath) {
  if (!filePath) return null;
  
  try {
    const file = bucket.file(`assessments/${filePath}`);
    const [exists] = await file.exists();
    
    if (!exists) {
      console.warn(`File not found in GCS: assessments/${filePath}`);
      return null;
    }

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const [url] = await file.getSignedUrl(options);
     console.log(`Generated signed URL for: assessments/${filePath}`);
     console.log(`Signed URL: ${url}`);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

// Add a new assessment to a course
router.post('/courses/:courseId/assessments', upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const { courseId } = req.params;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required.' });
    }

    let filePath = null;
    let originalName = null;

    if (req.file) {
      const uploadResult = await uploadToGCS(req.file);
      filePath = uploadResult.filePath;
      originalName = req.file.originalname;
    }

    const assessment = new Assessment({
      course: courseId,
      title,
      description,
      dueDate,
      filePath,
      originalName,
    });

    await assessment.save();
    const downloadUrl = await getSignedUrl(assessment.filePath);

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: {
        ...assessment.toObject(),
        downloadUrl
      },
    });
  } catch (error) {
    console.error('Error adding assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all assessments for a course (with signed URLs)
router.get('/courses/:courseId/assessments', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate courseId format if it's supposed to be ObjectId
    if (courseId.length !== 24 && !/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const assessments = await Assessment.find({ course: courseId }).sort({ createdAt: -1 });
    
    const assessmentsWithUrls = await Promise.all(
      assessments.map(async assessment => {
        const downloadUrl = assessment.filePath ? await getSignedUrl(assessment.filePath) : null;
        
        // Debug log for each assessment
        console.log(`Fetched assessment: ${assessment.title}, downloadUrl: ${downloadUrl ? 'exists' : 'null'}`);
        
        return {
          ...assessment.toObject(),
          downloadUrl
        };
      })
    );

    console.log(`Fetched ${assessmentsWithUrls.length} assessments for course ${courseId}`);
    
    res.status(200).json(assessmentsWithUrls);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download a single assessment (redirect to signed URL)
router.get('/assessments/:assessmentId/download', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    if (!assessment.filePath) {
      return res.status(404).json({ message: 'File not found for this assessment' });
    }

    const url = await getSignedUrl(assessment.filePath);
    
    if (!url) {
      return res.status(404).json({ message: 'File not found in storage' });
    }

    res.redirect(url);
  } catch (error) {
    console.error('Error downloading assessment file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an assessment (handle new file upload)
router.put('/assessments/:assessmentId', upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (req.file) {
      // Delete old file from GCS if exists
      if (assessment.filePath) {
        try {
          await bucket.file(`assessments/${assessment.filePath}`).delete();
        } catch (deleteError) {
          console.warn('Could not delete old file:', deleteError.message);
          // Continue with upload even if delete fails
        }
      }

      const uploadResult = await uploadToGCS(req.file);
      assessment.filePath = uploadResult.filePath;
      assessment.originalName = req.file.originalname;
    }

    if (title) assessment.title = title;
    if (description !== undefined) assessment.description = description;
    if (dueDate) assessment.dueDate = dueDate;

    await assessment.save();
    const downloadUrl = assessment.filePath ? await getSignedUrl(assessment.filePath) : null;

    res.status(200).json({
      message: 'Assessment updated successfully',
      assessment: {
        ...assessment.toObject(),
        downloadUrl
      },
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an assessment
router.delete('/assessments/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.filePath) {
      try {
        await bucket.file(`assessments/${assessment.filePath}`).delete();
      } catch (deleteError) {
        console.warn('Could not delete file from GCS:', deleteError.message);
        // Continue with deletion even if file delete fails
      }
    }

    await Assessment.findByIdAndDelete(assessmentId);
    
    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;