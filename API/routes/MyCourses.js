const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MyCourses = require('../models/MyCourses');
const Course = require('../models/Course');

// Route to enroll in a course
router.post(
  '/enroll',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, courseId } = req.body;

    try {
      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the user already exists in MyCourses
      let userCourses = await MyCourses.findOne({ email });
      if (!userCourses) {
        // Create a new MyCourses entry if the user doesn't exist
        userCourses = new MyCourses({
          name,
          email,
          enrolledCourses: [courseId],
        });
      } else {
        // Add the course to the enrolledCourses array if not already enrolled
        if (!userCourses.enrolledCourses.includes(courseId)) {
          userCourses.enrolledCourses.push(courseId);
        } else {
          return res.status(400).json({ message: 'Already enrolled in this course' });
        }
      }

      await userCourses.save();
      res.status(200).json({ message: 'Enrolled successfully', myCourses: userCourses });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Route to get enrolled courses for a user
router.get('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const userCourses = await MyCourses.findOne({ email }).populate('enrolledCourses');
    if (!userCourses) {
      return res.status(404).json({ message: 'No enrolled courses found for this user' });
    }

    res.status(200).json(userCourses);
  } catch (error) {
    console.error('Error retrieving enrolled courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to retrieve course details by courseId
router.get('/retrieve/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    // Find the course in the Course model
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error retrieving course details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;