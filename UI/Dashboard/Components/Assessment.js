// assessments.js
import { renderContent } from './Render.js';


// Fetch assessments from the API
async function fetchAssessments() {
  try {
    const response = await fetch('http://localhost:5000/api/assessments'); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch assessments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
}

function renderAssessmentRow(assessment) {
  const statusClass = assessment.status.toLowerCase().replace(' ', '-');
  const actionText = assessment.status === 'Upcoming' ? 'Attempt' : 'View';
  const gradeDisplay = assessment.grade || 'N/A';

  return `
    <tr class="assessment-row ${statusClass}">
      <td>${assessment.name}</td>
      <td>${assessment.course}</td>
      <td>${new Date(assessment.dueDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${statusClass}">${assessment.status}</span></td>
      <td>${gradeDisplay}</td>
      <td>
        <button class="btn btn-sm ${assessment.status === 'Upcoming' ? 'btn-primary' : 'btn-outline-primary'}" 
                data-action="${actionText.toLowerCase()}" 
                data-assessment-id="${assessment.id}">
          ${actionText}
        </button>
      </td>
    </tr>
  `;
}

function handleAssessmentActions() {
  document.querySelectorAll('.assessment-row button').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const assessmentId = e.target.dataset.assessmentId;
      
      // In a real app, this would route to the appropriate assessment view
      console.log(`${action} assessment ${assessmentId}`);
      
      // Temporary simulation
      alert(`Simulated action: ${action} assessment`);
    });
  });
}

function renderEmptyState() {
  return `
    <tr>
      <td colspan="6" class="text-center py-4">
        <div class="empty-state">
          <i class="fas fa-clipboard-list fa-2x mb-2"></i>
          <p>No assessments available at this time</p>
        </div>
      </td>
    </tr>
  `;
}

export async function renderAssessmentsTab(containerId = 'contentArea') {
  try {
    // Fetch assessments from the API
    const assessments = await fetchAssessments();

    const content = `
      <div class="assessments-container">
        <div class="assessments-header mb-4">
          <h2 class="fw-bold">Assessments</h2>
          <p class="text-muted">Track your upcoming and completed assessments</p>
        </div>
        
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover assessments-table">
                <thead class="table-light">
                  <tr>
                    <th>Assessment</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${assessments.length > 0 
                    ? assessments.map(assessment => renderAssessmentRow(assessment)).join('') 
                    : renderEmptyState()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    render(containerId, content);
    handleAssessmentActions();
    
  } catch (error) {
    console.error("Error rendering assessments:", error);
    render(containerId, `
      <div class="alert alert-danger">
        Failed to load assessments. Please try again later.
      </div>
    `);
  }
}

// For testing purposes if needed
window.renderAssessmentsTab = renderAssessmentsTab;