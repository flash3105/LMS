const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course'); 

// Route to add a new course
router.post(
    '/add',
    [
      body('courseName').notEmpty().trim().withMessage('Course Name is required'),
      body('courseCode').notEmpty().trim().withMessage('Course Code is required'),
      body('authorEmail').isEmail().normalizeEmail().withMessage('Valid Author Email is required'),
      body('courseDescription').notEmpty().trim().withMessage('Course Description is required'),
      body('visibility').isIn(['public', 'private']).withMessage('Visibility must be public or private'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const newCourse = new Course({
          title: req.body.courseName, // Consider consistent naming
          code: req.body.courseCode,
          authorEmail: req.body.authorEmail,
          description: req.body.courseDescription,
          visibility: req.body.visibility,
          createdAt: new Date()
        });
  
        await newCourse.save();
        res.status(201).json({ 
          message: 'Course added successfully', 
          course: newCourse 
        });
        console.log('Course added successfully:', newCourse); // Log only
      } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ 
          message: 'Server error',
          error: error.message 
        });
      }
    }
  );

module.exports = router;