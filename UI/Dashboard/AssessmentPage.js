import { fetchAssessments, fetchAllQuizzes, fetchCourseDetails } from './Data/data.js';

// Use API_BASE_URL from .env or fallback
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Helper to fetch grades for the user
async function fetchUserGrades(email) {
  const res = await fetch(`${API_BASE_URL}/grades/user/${email}/course/all`);
  if (!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}

async function fetchAssessmentsGrades(email){
  const res = await fetch (`${API_BASE_URL}/graded/${email}/all`);
  if(!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}


function loadAssessmentPageCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './AssessmentPage.css'; // Adjust path if needed
  document.head.appendChild(link);
}

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
    <div class="assessment-page-container">
      <h2>All Assessments & Quizzes</h2>
      <div id="assessmentsTableContainer">
        <div class="empty-message">Loading assessments...</div>
      </div>
    </div>
  `;

  try {
    // Fetch all assessments for each course in parallel
    const assessmentsArrays = [];
    for (const course of my_courses) {
      const courseId = typeof course === 'string' ? course : course._id;
      if (courseId) {
        const assessments = await fetchAssessments(courseId);
        assessmentsArrays.push(assessments);
      }
    }
    const assessments = assessmentsArrays.flat();

    // Optionally, fetch course details if you want to display course names
    // const courseDetailsArr = await Promise.all(my_courses.map(id => fetchCourseDetails(id)));
    // const courseMap = Object.fromEntries(courseDetailsArr.map(c => [c._id, c.title]));

    const [quizzes, grades,ASSgrades] = await Promise.all([
      fetchAllQuizzes(),
      fetchUserGrades(userEmail),
      fetchAssessmentsGrades(userEmail)
    ]);
    console.log('feched:',ASSgrades);

    // Get course IDs as strings for comparison
    const courseIds = my_courses.map(c => typeof c === 'string' ? c : c._id);

    // Filter quizzes to only those for enrolled courses
    const filteredQuizzes = quizzes.filter(q =>
      courseIds.includes(q.courseId?.toString())
    );

    // Merge grades and feedback into assessments and quizzes
    const assessmentsWithGrades = assessments.map(a => {
      const gradeObj = ASSgrades.find(g => (g.assessmentId === a._id || g.assessmentId === a.id));
      return {
        ...a,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        type: 'Assignment'
      };
    });

    const quizzesWithGrades = filteredQuizzes.map(q => {
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

    // Combine and sort by due date (optional)
    const allItems = [...assessmentsWithGrades, ...quizzesWithGrades].sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const bDate = b.dueDate ? new Date(b.dueDate) : new Date(0);
      return aDate - bDate;
    });

    const tableHtml = renderAssessmentsTable(allItems);
    document.getElementById('assessmentsTableContainer').innerHTML = tableHtml;
  } catch (error) {
    document.getElementById('assessmentsTableContainer').innerHTML = `
      <div class="error-message">Failed to load assessments.</div>
    `;
  }
}

// Update the table to show type (Assignment/Quiz) and feedback
function renderAssessmentsTable(items) {
  if (!items || items.length === 0) {
    return `<div class="empty-message">No assessments or quizzes found.</div>`;
  }
  return `
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
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
            // Normalize dates to midnight for fair comparison
            const duePassed = a.dueDate && new Date(new Date(a.dueDate).setHours(0,0,0,0)) < new Date(new Date().setHours(0,0,0,0));
            // Consider 'N/A' as no grade
            const noGrade = a.grade === undefined || a.grade === null || a.grade === '' || a.grade === 'N/A';
            const highlight = isQuiz && duePassed && noGrade ? 'style="background:#ffeaea;color:#b71c1c;"' : '';
            return `
              <tr ${highlight}>
                <td>${a.type || 'N/A'}</td>
                <td>${a.title || 'N/A'}</td>
                <td>${a.grade !== undefined && a.grade !== null && a.grade !== '' ? a.grade : 'N/A'}</td>
                <td>${a.feedback || '—'}</td>
                <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}