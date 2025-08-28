const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MyCourses = require('../models/MyCourses');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Profile = require('../models/Profile'); 

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

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the MyCourses entry by user ID
    const userCourses = await MyCourses.findOne({ userId }).populate('enrolledCourses');
    if (!userCourses) {
      return res.status(404).json({ message: 'No enrolled courses found for this user' });
    }

    // Fetch the actual User document
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const coursesWithEnrollment = [];

    for (const course of userCourses.enrolledCourses) {
      let enrollment = await Enrollment.findOne({ user: user._id, course: course._id });

      // Create Enrollment if it doesn't exist (old courses)
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
    console.error('Error retrieving enrolled courses by userId:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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
      _id: user._id,
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

// Route to get a single enrolled course by courseId for a user
router.get('/:email/course/:courseId', async (req, res) => {
  const { email, courseId } = req.params;

  try {
    // Fetch the user's enrolled courses
    const userCourses = await MyCourses.findOne({ email }).populate('enrolledCourses');
    if (!userCourses) {
      return res.status(404).json({ message: 'No enrolled courses found for this user' });
    }

    // Fetch the user info
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the specific course
    const course = userCourses.enrolledCourses.find(c => c._id.toString() === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found in enrolled courses' });
    }

    // Check or create enrollment
    let enrollment = await Enrollment.findOne({ user: user._id, course: course._id });
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
    const courseWithEnrollment = {
      ...course.toObject(),
      progress: enrollment.progress,
      status: enrollment.status,
      certificateId: enrollment.certificateId,
    };

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      course: courseWithEnrollment,
    });

  } catch (error) {
    console.error('Error retrieving enrolled course:', error);
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

    // Get user email for milestone tracking
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    // Check and add milestones if needed
    await addCourseProgressMilestone(user.email, courseId, progress, enrollment);

    await enrollment.save();

    res.status(200).json({ 
      message: 'Enrollment updated successfully', 
      progress: enrollment.progress, 
      status: enrollment.status,
      milestones: enrollment.milestones
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to add course progress milestone
async function addCourseProgressMilestone(email, courseId, progress, enrollment) {
  try {
    // Find the profile for the user
    const profile = await Profile.findOne({ email });
    if (!profile) {
      console.log('Profile not found for email:', email);
      return;
    }

    let milestoneTitle = '';
    let milestoneDescription = '';
    let shouldAddMilestone = false;
    let milestoneType = 'course';

    // Check progress thresholds and set appropriate milestone
    if (progress >= 25 && !enrollment.milestones.term1) {
      milestoneTitle = 'Term 1 Complete';
      milestoneDescription = `Completed 25% of the course`;
      enrollment.milestones.term1 = true;
      shouldAddMilestone = true;
    } else if (progress >= 50 && !enrollment.milestones.term2) {
      milestoneTitle = 'Term 2 Complete';
      milestoneDescription = `Completed 50% of the course`;
      enrollment.milestones.term2 = true;
      shouldAddMilestone = true;
    } else if (progress >= 75 && !enrollment.milestones.term3) {
      milestoneTitle = 'Term 3 Complete';
      milestoneDescription = `Completed 75% of the course`;
      enrollment.milestones.term3 = true;
      shouldAddMilestone = true;
    } else if (progress === 100 && !enrollment.milestones.term4) {
      milestoneTitle = 'Course Completed';
      milestoneDescription = `Completed 100% of the course`;
      enrollment.milestones.term4 = true;
      shouldAddMilestone = true;
    }

    if (shouldAddMilestone) {
      // Check if milestone already exists for this course progress
      const existingMilestone = profile.milestones.find(m => 
        m.title === milestoneTitle && m.courseId && m.courseId.toString() === courseId.toString()
      );

      if (existingMilestone) {
        console.log('Milestone already exists for this course progress');
        return; // Milestone already exists
      }

      // Add new milestone to profile
      const milestone = {
        title: milestoneTitle,
        description: milestoneDescription,
        achievedOn: new Date(),
        courseId: courseId,
        type: milestoneType,
        score: progress // Store the progress percentage as score
      };

      await Profile.findOneAndUpdate(
        { email },
        { $push: { milestones: milestone } },
        { new: true, upsert: true }
      );

      console.log(`Added milestone for ${email}: ${milestoneTitle}`);
      
      // Save the updated enrollment with milestone flags
      await enrollment.save();
    }
  } catch (err) {
    console.error('Error adding course progress milestone:', err);
  }
}

router.post('/summary', async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'Emails array is required' });
  }

  try {
    // Fetch all users in one go
    const users = await User.find({ email: { $in: emails } });
    const userMap = {};
    users.forEach(u => userMap[u.email] = u);

    // Fetch all MyCourses entries in one go
    const myCoursesList = await MyCourses.find({ email: { $in: emails } }).populate('enrolledCourses');
    const result = {};

    for (const userCourses of myCoursesList) {
      const email = userCourses.email;
      const user = userMap[email];
      if (!user) continue;

      const coursesWithEnrollment = [];

      for (const course of userCourses.enrolledCourses) {
        // Fetch enrollment for each course
        let enrollment = await Enrollment.findOne({ user: user._id, course: course._id });

        // If Enrollment doesn't exist (legacy data), create a default
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

        coursesWithEnrollment.push({
          _id: course._id,
          title: course.title,
          progress: enrollment.progress,
          status: enrollment.status,
          certificateId: enrollment.certificateId,
        });
      }

      result[email] = coursesWithEnrollment;
    }

    res.status(200).json(result);

  } catch (err) {
    console.error('Error fetching course summaries:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;