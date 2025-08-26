const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MyCourses = require('../models/MyCourses');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

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

      // For enrollments, to track statusand progress
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      let enrollment = await Enrollment.findOne({ user: user._id, course: courseId });
      if (!enrollment) {
          enrollment = new Enrollment({
          user: user._id, // ObjectId of the user
          course: courseId,
          status: 'enrolled',
          progress: 0,
          certificateId: null,
        });
        await enrollment.save(); 
      }

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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const coursesWithEnrollment = [];

    // Loop through all enrolled courses
    for (const course of userCourses.enrolledCourses) {
      // Try to find an existing Enrollment
      let enrollment = await Enrollment.findOne({ user: user._id, course: course._id });

      // If Enrollment doesn't exist (old courses), create a new one
      if (!enrollment) {
        enrollment = new Enrollment({
          user: user._id, 
          course: course._id,
          status: 'enrolled',
          progress: 0,
          certificateId: null,
        });
        await enrollment.save();
      }

      // Merge course data with enrollment info
      coursesWithEnrollment.push({
        ...course.toObject(),
        progress: enrollment.progress,
        status: enrollment.status,
        certificateId: enrollment.certificateId,
      });
    }

    res.status(200).json({
      _id: userCourses._id,
      name: userCourses.name,
      email: userCourses.email,
      enrolledCourses: coursesWithEnrollment,
      createdAt: userCourses.createdAt,
    });
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

router.post('/update-progress-status', async (req, res) => {
  const { userId, courseId, progress } = req.body;

  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Update progress
    enrollment.progress = progress;

    // Update status based on progress
    if (progress === 0) {
      enrollment.status = 'enrolled';
    } else if (progress > 0 && progress < 100) {
      enrollment.status = 'in progress';
    } else if (progress === 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();

    res.status(200).json({ 
      message: 'Enrollment updated successfully', 
      progress: enrollment.progress, 
      status: enrollment.status 
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;