import { fetchAllAssessments, fetchAllQuizzes } from './Data/data.js';

// Helper to fetch grades for the user
async function fetchUserGrades(email) {
  const res = await fetch(`http://localhost:5000/api/grades/user/${email}/course/all`);
  if (!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}

function loadAssessmentPageCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './AssessmentPage.css'; // Adjust path if needed
  document.head.appendChild(link);
}

export async function renderAssessmentPage(contentArea) {
  // Get user email from localStorage or global user object
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : (typeof currentUser !== 'undefined' ? currentUser : null);
  const userEmail = user && user.email ? user.email : null;

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
    const [assessments, quizzes, grades] = await Promise.all([
      fetchAllAssessments(),
      fetchAllQuizzes(),
      fetchUserGrades(userEmail)
    ]);

    // Merge grades and feedback into assessments and quizzes
    const assessmentsWithGrades = assessments.map(a => {
      const gradeObj = grades.find(g => g.type === 'assignment' && (g.refId === a._id || g.refId === a.id));
      return {
        ...a,
        grade: gradeObj ? gradeObj.grade : undefined,
        feedback: gradeObj ? gradeObj.feedback : undefined,
        type: 'Assignment'
      };
    });

    const quizzesWithGrades = quizzes.map(q => {
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
          ${items.map(a => `
            <tr>
              <td>${a.type || 'N/A'}</td>
              <td>${a.title || 'N/A'}</td>
              <td>${a.grade !== undefined ? a.grade : 'N/A'}</td>
              <td>${a.feedback || '—'}</td>
              <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}