import { fetchAllAssessments } from './Data/data.js';

function loadAssessmentPageCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './AssessmentPage.css'; // Adjust path if needed
  document.head.appendChild(link);
}

export async function renderAssessmentPage(contentArea) {
  loadAssessmentPageCSS();

  contentArea.innerHTML = `
    <div class="assessment-page-container">
      <h2>All Assessments</h2>
      <div id="assessmentsTableContainer">
        <div class="empty-message">Loading assessments...</div>
      </div>
    </div>
  `;

  try {
    const assessments = await fetchAllAssessments();
    const tableHtml = renderAssessmentsTable(assessments);
    document.getElementById('assessmentsTableContainer').innerHTML = tableHtml;
  } catch (error) {
    document.getElementById('assessmentsTableContainer').innerHTML = `
      <div class="error-message">Failed to load assessments.</div>
    `;
  }
}

function renderAssessmentsTable(assessments) {
  if (!assessments || assessments.length === 0) {
    return `<div class="empty-message">No assessments found.</div>`;
  }
  return `
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${assessments.map(a => `
            <tr>
              <td>${a.title || 'N/A'}</td>
              <td>${a.grade !== undefined ? a.grade : 'N/A'}</td>
              <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}