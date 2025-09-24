import { fetchAssessments, fetchAllQuizzes, fetchCourseDetails } from './Data/data.js';

// Use API_BASE_URL from .env or fallback
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Helper to fetch grades for the user
async function fetchUserGrades(email) {
  const res = await fetch(`${API_BASE_URL}/grades/user/${email}/course/all`);
  if (!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}

async function fetchAssessmentsGrades(email) {
  const res = await fetch(`${API_BASE_URL}/graded/${email}/all`);
  if (!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}

function loadAssessmentPageCSS() {
  const style = document.createElement('style');
  style.textContent = `
    /* Mobile-First Styles - Hidden by default on desktop */
    .mobile-assessment-container {
      display: none;
      min-height: 100vh;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    }

    .mobile-assessment-header {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      padding: 20px 16px;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .mobile-assessment-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .mobile-assessment-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    .mobile-assessment-content {
      padding: 16px;
    }

    .mobile-course-folder {
      background: white;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .mobile-folder-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
    }

    .mobile-folder-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .mobile-folder-icon {
      color: #3182ce;
    }

    .mobile-folder-chevron {
      transition: transform 0.3s ease;
    }

    .mobile-folder-content {
      display: none;
      padding: 0;
    }

    .mobile-assessment-item {
      padding: 16px;
      border-bottom: 1px solid #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mobile-assessment-item:last-child {
      border-bottom: none;
    }

    .mobile-assessment-header-row {
      display: flex;
      justify-content: between;
      align-items: flex-start;
      gap: 8px;
    }

    .mobile-assessment-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .mobile-assessment-type.assignment {
      background: #e3f2fd;
      color: #1976d2;
    }

    .mobile-assessment-type.quiz {
      background: #e3f2fd;
      color: #28a745;
    }

    .mobile-assessment-name {
      font-weight: 600;
      color: #2c3e50;
      flex: 1;
      font-size: 14px;
    }

    .mobile-assessment-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;
      color: #666;
    }

    .mobile-detail-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mobile-detail-label {
      font-weight: 500;
      color: #888;
    }

    .mobile-detail-value {
      font-weight: 600;
    }

    .mobile-grade-value {
      font-weight: 700;
      font-size: 13px;
    }

    .mobile-grade-a { color: #2e7d32; }
    .mobile-grade-b { color: #689f38; }
    .mobile-grade-c { color: #ef6c00; }
    .mobile-grade-d { color: #d84315; }
    .mobile-grade-f { color: #c62828; }

    .mobile-past-due {
      color: #c62828;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mobile-past-due-badge {
      background: #c62828;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    .mobile-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      background: white;
      border-radius: 12px;
    }

    .mobile-error-state {
      text-align: center;
      padding: 40px 20px;
      color: #c62828;
      background: #ffebee;
      border-radius: 12px;
      border: 1px solid #ffcdd2;
    }

    /* Desktop Styles - Hidden by default on mobile */
    .assessment-container {
      display: none;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    }
    
    .profile-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    }
    
    .welcome {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    
    .welcome h2 {
      color: rgb(26, 115, 150);
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .welcome p {
      color: rgb(39, 106, 177);
      font-size: 1.1rem;
    }
    
    .assessments-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }
    
    .section-title {
      color: rgb(53, 143, 172);
      font-size: 1.5rem;
      margin: 0 0 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(44, 62, 80, 0.1);
    }
    
    .assessments-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }
    
    .assessments-table thead {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%) !important;
      color: white !important;
    }
    
    .assessments-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 500;
    }
    
    .assessments-table td {
      padding: 1rem;
      border-bottom: 1px solid #edf2f7;
      vertical-align: middle;
    }
    
    .assessments-table tbody tr:hover {
      background-color: #f8f9fa;
    }
    
    .assessment-type {
      display: inline-block;
      padding: 0.35rem 0.7rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .assessment-type.assignment {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .assessment-type.quiz {
      background-color: #e3f2fd;
      color: rgb(28, 175, 205);
    }
    
    .grade-cell {
      font-weight: bold;
      text-align: center;
    }
    
    .grade-a { color: #2e7d32; }
    .grade-b { color: #689f38; }
    .grade-c { color: #ef6c00; }
    .grade-d { color: #d84315; }
    .grade-f { color: #c62828; }
    
    .due-cell {
      position: relative;
      white-space: nowrap;
    }
    
    .past-due {
      color: #c62828;
    }
    
    .due-badge {
      display: inline-block;
      margin-left: 0.5rem;
      padding: 0.2rem 0.5rem;
      background-color: #c62828;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .late-quiz {
      background-color: #ffebee !important;
    }
    
    .late-quiz:hover {
      background-color: #ffcdd2 !important;
    }
    
    .empty-message, .error-message {
      padding: 2rem;
      text-align: center;
      color: #718096;
      background-color: white;
      border-radius: 8px;
    }
    
    .error-message {
      color: #c62828;
    }

    /* Folder styles for assessments */
    .folder-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 0.8rem 1.2rem;
      background: linear-gradient(90deg, #3182ce, #4299e1);
      border-radius: 10px;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .folder-header:hover {
      background: linear-gradient(90deg, #2b6cb0, #3182ce);
    }

    .folder-content {
      margin-top: 1rem;
      display: none;
    }

    .course-folder {
      margin-bottom: 2.5rem;
    }

    .foldered-assessments {
      margin-top: 1.5rem;
    }
    
    /* Responsive Behavior - Show only one container based on screen size */
    @media (max-width: 768px) {
      .assessment-container {
        display: none !important;
      }
      
      .mobile-assessment-container {
        display: block !important;
      }
    }
    
    @media (min-width: 769px) {
      .mobile-assessment-container {
        display: none !important;
      }
      
      .assessment-container {
        display: block !important;
      }
    }

    /* Loading Animation */
    .mobile-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
    }

    .desktop-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      margin: 20px 0;
    }

    .mobile-loading-spinner, .desktop-loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3182ce;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .desktop-loading-spinner {
      width: 40px;
      height: 40px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Function to detect mobile screen
function isMobileScreen() {
  return window.innerWidth <= 768;
}

// Main function to render assessment page
export async function renderAssessmentPage(contentArea) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : (typeof currentUser !== 'undefined' ? currentUser : null);
  const userEmail = user && user.email ? user.email : null;
  const my_courses = user && user.enrolledCourses ? user.enrolledCourses : [];
  
  if (!userEmail) {
    contentArea.innerHTML = `<div class="error-message">User not logged in.</div>`;
    return;
  }

  loadAssessmentPageCSS();

  // Render only the appropriate view based on screen size
  if (isMobileScreen()) {
    // Render mobile view only
    contentArea.innerHTML = `
      <div class="mobile-assessment-container">
        <div class="mobile-assessment-header">
          <div class="mobile-assessment-title">My Assessments</div>
          <div class="mobile-assessment-subtitle">Track all your assignments and quizzes</div>
        </div>
        
        <div class="mobile-assessment-content">
          <div id="mobileAssessmentsContainer">
            <div class="mobile-loading">
              <div class="mobile-loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Render desktop view only
    contentArea.innerHTML = `
      <div class="profile-container">
        <div class="welcome">
          <h2>My Assessments</h2>
          <p>Track all your assignments and quizzes in one place</p>
        </div>
        
        <div class="assessments-section">
          <div class="section-title">All Assessments by Course</div>
          <div id="assessmentsContainer">
            <div class="desktop-loading">
              <div class="desktop-loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  try {
    // Get courses from global data or fetch if not available
    let courses = window.courses || [];
    if (courses.length === 0) {
      const response = await fetch(`${API_BASE_URL}/courses/all`);
      if (response.ok) {
        courses = await response.json();
        window.courses = courses; // Store for future use
      }
    }

    // Extract course IDs
    const courseIds = my_courses.map(course => 
      typeof course === 'string' ? course : course._id || course.id
    ).filter(id => id);

    if (courseIds.length === 0) {
      if (isMobileScreen()) {
        document.getElementById('mobileAssessmentsContainer').innerHTML = `
          <div class="mobile-empty-state">You are not enrolled in any courses.</div>
        `;
      } else {
        document.getElementById('assessmentsContainer').innerHTML = `
          <div class="empty-message">You are not enrolled in any courses.</div>
        `;
      }
      return;
    }

    // Create course ID to name mapping using available course data
    const courseInfoMap = new Map();
    courseIds.forEach(courseId => {
      const course = courses.find(c => 
        c._id === courseId || c.id === courseId
      );
      
      if (course) {
        courseInfoMap.set(courseId, {
          name: course.courseName || course.name || course.title || 
                course.course_name || course.course_title || 
                `Course ${courseId.substring(0, 8)}`,
          id: courseId
        });
      } else {
        courseInfoMap.set(courseId, {
          name: `Course ${courseId.substring(0, 8)}`,
          id: courseId
        });
      }
    });
    
    // Fetch assessments for each course
    const assessmentsByCourse = {};
    for (const courseId of courseIds) {
      try {
        const assessments = await fetchAssessments(courseId);
        assessmentsByCourse[courseId] = assessments;
      } catch (error) {
        console.error(`Error fetching assessments for course ${courseId}:`, error);
        assessmentsByCourse[courseId] = [];
      }
    }

    const [quizzes, grades, ASSgrades] = await Promise.all([
      fetchAllQuizzes(),
      fetchUserGrades(userEmail),
      fetchAssessmentsGrades(userEmail)
    ]);

    const filteredQuizzes = quizzes.filter(q =>
      courseIds.includes(q.courseId?.toString())
    );

    // Render the appropriate view based on screen size
    if (isMobileScreen()) {
      // Render mobile assessments
      const mobileAssessmentsHtml = renderMobileAssessmentsByCourse(
        courseIds, 
        assessmentsByCourse, 
        filteredQuizzes, 
        grades, 
        ASSgrades,
        courseInfoMap
      );
      
      document.getElementById('mobileAssessmentsContainer').innerHTML = mobileAssessmentsHtml;

      // Add folder toggle functionality for mobile
      document.querySelectorAll('.mobile-folder-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const chevron = header.querySelector('.mobile-folder-chevron');

          if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
          } else {
            content.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
          }
        });
      });
    } else {
      // Render desktop assessments
      const assessmentsHtml = renderAssessmentsByCourse(
        courseIds, 
        assessmentsByCourse, 
        filteredQuizzes, 
        grades, 
        ASSgrades,
        courseInfoMap
      );
      
      document.getElementById('assessmentsContainer').innerHTML = assessmentsHtml;

      // Add folder toggle functionality for desktop
      document.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const icon = header.querySelector('.fas.fa-chevron-down');

          if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            icon.style.transform = 'rotate(0deg)';
          } else {
            content.style.display = 'none';
            icon.style.transform = 'rotate(-90deg)';
          }
        });
      });
    }

  } catch (error) {
    console.error('Error loading assessments:', error);
    
    if (isMobileScreen()) {
      document.getElementById('mobileAssessmentsContainer').innerHTML = `
        <div class="mobile-error-state">Failed to load assessments. ${error.message}</div>
      `;
    } else {
      document.getElementById('assessmentsContainer').innerHTML = `
        <div class="error-message">Failed to load assessments. ${error.message}</div>
      `;
    }
  }
}

// Function to render assessments grouped by course for desktop
function renderAssessmentsByCourse(courseIds, assessmentsByCourse, quizzes, grades, ASSgrades, courseInfoMap) {
  if (courseIds.length === 0) {
    return `<div class="empty-message">You are not enrolled in any courses.</div>`;
  }

  let hasAssessments = false;

  const coursesHtml = courseIds.map(courseId => {
    const courseInfo = courseInfoMap.get(courseId);
    
    if (!courseInfo) {
      return '';
    }
    
    const courseName = courseInfo.name;
    const courseAssessments = assessmentsByCourse[courseId] || [];
    const courseQuizzes = quizzes.filter(q => q.courseId?.toString() === courseId);

    // Process assessments with grades
    const assessmentsWithGrades = courseAssessments.map(a => {
      const gradeObj = ASSgrades.find(g => (g.assessmentId === a._id || g.assessmentId === a.id));
      return {
        ...a,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        type: 'Assignment'
      };
    });

    // Process quizzes with grades
    const quizzesWithGrades = courseQuizzes.map(q => {
      const gradeObj = grades.find(g => g.type === 'quiz' && (g.refId === q._id || g.refId === q.id));
      return {
        ...q,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        dueDate: q.dueDate,
        title: q.title,
        type: 'Quiz'
      };
    });

    const allItems = [...assessmentsWithGrades, ...quizzesWithGrades].sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const bDate = b.dueDate ? new Date(b.dueDate) : new Date(0);
      return aDate - bDate;
    });

    if (allItems.length > 0) {
      hasAssessments = true;
    }

    return `
      <div class="course-folder">
        <div class="folder-header">
          <span><i class="fas fa-folder-open" style="margin-right:8px;"></i> ${courseName}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="folder-content" style="display:none;">
          ${allItems.length > 0 ? renderAssessmentsTable(allItems) : '<div class="empty-message">No assessments for this course.</div>'}
        </div>
      </div>
    `;
  }).join('');

  if (!hasAssessments) {
    return `<div class="empty-message">No assessments or quizzes found in any of your courses.</div>`;
  }

  return `
    <div class="foldered-assessments">
      ${coursesHtml}
    </div>
  `;
}

// Function to render assessments for mobile view
function renderMobileAssessmentsByCourse(courseIds, assessmentsByCourse, quizzes, grades, ASSgrades, courseInfoMap) {
  if (courseIds.length === 0) {
    return `<div class="mobile-empty-state">You are not enrolled in any courses.</div>`;
  }

  let hasAssessments = false;

  const coursesHtml = courseIds.map(courseId => {
    const courseInfo = courseInfoMap.get(courseId);
    
    if (!courseInfo) {
      return '';
    }
    
    const courseName = courseInfo.name;
    const courseAssessments = assessmentsByCourse[courseId] || [];
    const courseQuizzes = quizzes.filter(q => q.courseId?.toString() === courseId);

    // Process assessments with grades
    const assessmentsWithGrades = courseAssessments.map(a => {
      const gradeObj = ASSgrades.find(g => (g.assessmentId === a._id || g.assessmentId === a.id));
      return {
        ...a,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        type: 'Assignment'
      };
    });

    // Process quizzes with grades
    const quizzesWithGrades = courseQuizzes.map(q => {
      const gradeObj = grades.find(g => g.type === 'quiz' && (g.refId === q._id || g.refId === q.id));
      return {
        ...q,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        dueDate: q.dueDate,
        title: q.title,
        type: 'Quiz'
      };
    });

    const allItems = [...assessmentsWithGrades, ...quizzesWithGrades].sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const bDate = b.dueDate ? new Date(b.dueDate) : new Date(0);
      return aDate - bDate;
    });

    if (allItems.length > 0) {
      hasAssessments = true;
    }

    return `
      <div class="mobile-course-folder">
        <div class="mobile-folder-header">
          <div class="mobile-folder-title">
            <i class="fas fa-folder mobile-folder-icon"></i>
            <span>${courseName}</span>
          </div>
          <i class="fas fa-chevron-down mobile-folder-chevron"></i>
        </div>
        <div class="mobile-folder-content" style="display:none;">
          ${allItems.length > 0 ? renderMobileAssessmentItems(allItems) : '<div class="mobile-empty-state" style="padding: 20px;">No assessments for this course</div>'}
        </div>
      </div>
    `;
  }).join('');

  if (!hasAssessments) {
    return `<div class="mobile-empty-state">No assessments or quizzes found in any of your courses.</div>`;
  }

  return coursesHtml;
}

// Function to render mobile assessment items
function renderMobileAssessmentItems(items) {
  if (!items || items.length === 0) {
    return `<div class="mobile-empty-state" style="padding: 20px;">No assessments found</div>`;
  }

  return items.map(item => {
    const isQuiz = item.type === 'Quiz';
    const duePassed = item.dueDate && new Date(new Date(item.dueDate).setHours(0,0,0,0)) < new Date(new Date().setHours(0,0,0,0));
    const noGrade = item.grade === undefined || item.grade === null || item.grade === '' || item.grade === 'N/A';
    const gradeClass = item.grade >= 90 ? 'mobile-grade-a' : 
                      item.grade >= 80 ? 'mobile-grade-b' : 
                      item.grade >= 70 ? 'mobile-grade-c' : 
                      item.grade >= 60 ? 'mobile-grade-d' : 'mobile-grade-f';
    
    const formattedDate = item.dueDate ? 
      new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
      'N/A';

    return `
      <div class="mobile-assessment-item">
        <div class="mobile-assessment-header-row">
          <span class="mobile-assessment-type ${item.type.toLowerCase()}">${item.type}</span>
          <span class="mobile-assessment-name">${item.title || 'N/A'}</span>
        </div>
        <div class="mobile-assessment-details">
          <div class="mobile-detail-item">
            <span class="mobile-detail-label">Grade</span>
            <span class="mobile-detail-value mobile-grade-value ${item.grade ? gradeClass : ''}">
              ${item.grade || 'N/A'}
            </span>
          </div>
          <div class="mobile-detail-item">
            <span class="mobile-detail-label">Due Date</span>
            <span class="mobile-detail-value ${duePassed ? 'mobile-past-due' : ''}">
              ${formattedDate}
              ${duePassed ? '<span class="mobile-past-due-badge">Past Due</span>' : ''}
            </span>
          </div>
          <div class="mobile-detail-item" style="grid-column: 1 / -1;">
            <span class="mobile-detail-label">Feedback</span>
            <span class="mobile-detail-value">${item.feedback || '—'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Original desktop table rendering function
function renderAssessmentsTable(items) {
  if (!items || items.length === 0) {
    return `<div class="empty-message">No assessments or quizzes found.</div>`;
  }
  return `
    <table class="assessments-table">
      <thead style="background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);">
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Grade</th>
          <th>Feedback</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(a => {
          const isQuiz = a.type === 'Quiz';
          const duePassed = a.dueDate && new Date(new Date(a.dueDate).setHours(0,0,0,0)) < new Date(new Date().setHours(0,0,0,0));
          const noGrade = a.grade === undefined || a.grade === null || a.grade === '' || a.grade === 'N/A';
          const highlightClass = isQuiz && duePassed && noGrade ? 'late-quiz' : '';
          const gradeClass = a.grade >= 90 ? 'grade-a' : a.grade >= 80 ? 'grade-b' : a.grade >= 70 ? 'grade-c' : a.grade >= 60 ? 'grade-d' : 'grade-f';
          
          return `
            <tr class="${highlightClass}">
              <td><span class="assessment-type ${a.type.toLowerCase()}">${a.type || 'N/A'}</span></td>
              <td>${a.title || 'N/A'}</td>
              <td class="grade-cell ${a.grade !== undefined && a.grade !== null && a.grade !== '' ? gradeClass : ''}">
                ${a.grade !== undefined && a.grade !== null && a.grade !== '' ? a.grade : 'N/A'}
              </td>
              <td>${a.feedback || '—'}</td>
              <td class="due-cell ${duePassed ? 'past-due' : ''}">
                ${a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                ${duePassed ? '<span class="due-badge">Past Due</span>' : ''}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Add resize listener to handle screen size changes
window.addEventListener('resize', () => {
  // Re-render the page when screen size changes significantly
  if (window.assessmentRendered && Math.abs(window.lastScreenWidth - window.innerWidth) > 100) {
    window.lastScreenWidth = window.innerWidth;
    // You might want to add a debounce here to prevent excessive re-renders
  }
});

window.lastScreenWidth = window.innerWidth;