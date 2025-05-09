// assessments.js


// Fetch assessments from the API
async  function fetchAssessments() {
  try {
    const response = await fetch('http://localhost:5000/api/assessments'); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch assessments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw new Error('Failed to fetch assessments');

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

function renderEmptyState(container) {
  container.innerHTML = `
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
    const assessments = await fetchAssessments();

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }

    container.innerHTML = `
      <div class="assessments-container">
        <h2 class="fw-bold">Assessments</h2>
        <p class="text-muted">Track your upcoming and completed assessments</p>
        <table class="table">
          <thead>
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
            ${assessments.map(renderAssessmentRow).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering assessments:', error);

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="assessments-container text-center py-5">
          <h2 class="fw-bold">Assessments</h2>
          <p class="text-muted">Coming Soon</p>
        </div>
      `;
    }
  }
}
