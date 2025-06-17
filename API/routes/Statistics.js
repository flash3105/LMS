const express = require('express');
const router = express.Router();
const Statistics = require('../models/Statistics');
const User = require("../models/User");
const Course = require("../models/Course");
const Assessment = require("../models/Assessment");
const Quiz = require("../models/Quiz");
const Grade = require("../models/Grade"); // each grade has: learnerEmail, courseId, grade, assessmentTitle, etc.


router.get('/', async (req, res) => {
  try {
    const [users, courses, assessments, quizzes, grades] = await Promise.all([
      User.find(),
      Course.find(),
      Assessment.find(),
      Quiz.find(),
      Grade.find()
    ]);

    const today = new Date();
    const todayStr = today.toDateString();

    // Total and new users
    const totalUsers = users.length;
    const newUsers = users.filter(u => new Date(u.createdAt).toDateString() === todayStr).length;
    const activeUsers = users.filter(u => new Date(u.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000).length;

    // Total and new courses
    const totalCourses = courses.length;
    const newCourses = courses.filter(c => new Date(c.createdAt).toDateString() === todayStr).length;

    // Grades per course
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course._id] = {
        courseId: course._id,
        courseName: course.name,
        learners: []
      };
    });

    // Group grades per course and learner
    const learnerMap = {}; // nested: { courseId -> { learnerEmail -> learnerData } }

    grades.forEach(g => {
      const courseId = g.courseId;
      if (!learnerMap[courseId]) learnerMap[courseId] = {};

      const learner = learnerMap[courseId][g.learnerEmail] ?? {
        learnerEmail: g.learnerEmail,
        learnerName: g.learnerName,
        grades: []
      };

      learner.grades.push({
        assessmentTitle: g.assessmentTitle,
        grade: g.grade,
        feedback: g.feedback || ''
      });

      learnerMap[courseId][g.learnerEmail] = learner;
    });

    // Calculate averages
    Object.entries(learnerMap).forEach(([courseId, learners]) => {
      Object.values(learners).forEach(learner => {
        const grades = learner.grades.map(g => g.grade);
        learner.averageGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
        courseMap[courseId].learners.push(learner);
      });
    });

    const gradesPerCourse = Object.values(courseMap);

    // Create statistics object
    const statistics = await Statistics.create({
      gradesPerCourse,
      totalUsers,
      totalCourses,
      totalAssessments: assessments.length,
      totalQuizzes: quizzes.length,
      activeUsers,
      newUsers,
      newCourses
    });

    res.json(statistics);
  } catch (err) {
    console.error("Failed to generate statistics:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;