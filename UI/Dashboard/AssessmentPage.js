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
    .assessment-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    }
    
      .profile-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
       background: linear-gradient(135deg,rgb(125, 152, 173) 0%, #3182ce 100%);
      }
      
      .welcome {
        margin-bottom: 2.5rem;
        text-align: center;
      }
      
      .welcome h2 {
        color:rgb(26, 115, 150);
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .welcome p {
        color:rgb(39, 106, 177);
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
      color:rgb(53, 143, 172);
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
      color:rgb(28, 175, 205);
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
    
    @media (max-width: 768px) {
      .assessment-container {
        padding: 1rem;
      }
      
      .assessments-table {
        display: block;
        overflow-x: auto;
      }
    }
  `;
  document.head.appendChild(style);
}

// MODIFIED: Main function to render assessment page with course names
export async function renderAssessmentPage(contentArea) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : (typeof currentUser !== 'undefined' ? currentUser : null);
  const userEmail = user && user.email ? user.email : null;
  const my_courses = user && user.enrolledCourses ? user.enrolledCourses : [];
  if (!userEmail) {
    contentArea.innerHTML = `<div class="error-message">User not logged in.</div>`;
    return;
  }

  loadAssessmentPageCSS();

  contentArea.innerHTML = `
    <div class="profile-container">
      <div class="welcome">
        <h2>My Assessments</h2>
        <p>Track all your assignments and quizzes in one place</p>
      </div>
      
      <div class="assessments-section">
        <div class="section-title">All Assessments by Course</div>
        <div id="assessmentsContainer">
          <div class="empty-message">Loading assessments...</div>
        </div>
      </div>
    </div>
  `;

  try {
    // CHANGED: Get courses from global data or fetch if not available
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
      document.getElementById('assessmentsContainer').innerHTML = `
        <div class="empty-message">You are not enrolled in any courses.</div>
      `;
      return;
    }

    // CHANGED: Create course ID to name mapping using available course data
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

    // Render assessments with course NAME instead of ID
    const assessmentsHtml = renderAssessmentsByCourse(
      courseIds, 
      assessmentsByCourse, 
      filteredQuizzes, 
      grades, 
      ASSgrades,
      courseInfoMap
    );
    
    document.getElementById('assessmentsContainer').innerHTML = assessmentsHtml;

    // Add folder toggle functionality
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

  } catch (error) {
    console.error('Error loading assessments:', error);
    document.getElementById('assessmentsContainer').innerHTML = `
      <div class="error-message">Failed to load assessments. ${error.message}</div>
    `;
  }
}

// MODIFIED: Function to render assessments grouped by course (using course names)
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
    
    // MODIFIED: Use course name instead of ID for folder display
    const courseName = courseInfo.name;
    
    // FIXED: assessmentsByCourse[courseId] is now an array, not an object with folders
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