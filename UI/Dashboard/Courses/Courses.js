// Courses.js
import { fetchCourseDetails } from '../Data/data.js';

export async function renderCourseDetails(contentArea, course) {
  // Show loading state
  contentArea.innerHTML = `
    <div class="course-details-loading">
      <h2>Loading Course Details...</h2>
    </div>
  `;

  try {
    // Fetch detailed course information including resources and assessments
    const courseDetails = await fetchCourseDetails(course._id);
    
    // Render the course details page
    contentArea.innerHTML = `
      <div class="course-details-container">
        <!-- Course Header Section -->
        <div class="course-header">
          <h1 class="course-title">${course.courseName}</h1>
          <p class="course-description">${course.courseDescription}</p>
          <div class="course-meta">
            <span class="badge bg-primary">${course.courseCode}</span>
            <span class="text-muted">Author: ${course.authorEmail}</span>
          </div>
        </div>
        
        <!-- Course Navigation Tabs -->
        <ul class="nav nav-tabs" id="courseTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="resources-tab" data-bs-toggle="tab" data-bs-target="#resources" type="button" role="tab">Resources</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="assessments-tab" data-bs-toggle="tab" data-bs-target="#assessments" type="button" role="tab">Assessments</button>
          </li>
        </ul>
        
        <!-- Tab Content -->
        <div class="tab-content" id="courseTabsContent">
          <!-- Resources Tab -->
          <div class="tab-pane fade show active" id="resources" role="tabpanel">
            <div class="resources-container" id="resourcesContainer">
              ${renderResources(courseDetails.resources || [])}
            </div>
          </div>
          
          <!-- Assessments Tab -->
          <div class="tab-pane fade" id="assessments" role="tabpanel">
            <div class="assessments-container" id="assessmentsContainer">
              ${renderAssessments(courseDetails.assessments || [])}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Initialize Bootstrap tabs if needed
    if (window.bootstrap) {
      new window.bootstrap.Tab(document.querySelector('#resources-tab'));
    }
    
  } catch (error) {
    console.error("Error rendering course details:", error);
    contentArea.innerHTML = `
      <div class="alert alert-danger">
        <h2>Error Loading Course</h2>
        <p>${error.message || 'Failed to load course details'}</p>
        <button class="btn btn-secondary" onclick="window.history.back()">Go Back</button>
      </div>
    `;
  }
}

function renderResources(resources) {
  if (resources.length === 0) {
    return `
      <div class="empty-resources">
        <p>No resources available for this course yet.</p>
      </div>
    `;
  }
  
  return `
    <div class="resource-list">
      ${resources.map(resource => `
        <div class="resource-item card mb-3">
          <div class="card-body">
            <h5 class="card-title">${resource.title}</h5>
            <p class="card-text">${resource.description || 'No description provided'}</p>
            <div class="resource-actions">
              ${resource.type === 'link' ? 
                `<a href="${resource.url}" target="_blank" class="btn btn-outline-primary">Open Link</a>` : 
                `<button class="btn btn-outline-primary">Download File</button>`}
            </div>
            ${resource.uploadDate ? `<small class="text-muted">Posted on ${new Date(resource.uploadDate).toLocaleDateString()}</small>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAssessments(assessments) {
  if (assessments.length === 0) {
    return `
      <div class="empty-assessments">
        <p>No assessments available for this course yet.</p>
      </div>
    `;
  }
  
  return `
    <div class="assessment-list">
      ${assessments.map(assessment => `
        <div class="assessment-item card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="card-title">${assessment.title}</h5>
                <p class="card-text">${assessment.description || 'No description provided'}</p>
              </div>
              <span class="badge ${getAssessmentBadgeClass(assessment.status)}">
                ${assessment.status || 'Pending'}
              </span>
            </div>
            
            <div class="assessment-meta mt-2">
              <small class="text-muted me-3">
                <strong>Due:</strong> ${assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'No due date'}
              </small>
              <small class="text-muted">
                <strong>Points:</strong> ${assessment.points || 'N/A'}
              </small>
            </div>
            
            <div class="assessment-actions mt-3">
              ${assessment.status === 'completed' ? 
                `<button class="btn btn-success btn-sm" disabled>Completed</button>` : 
                `<button class="btn btn-primary btn-sm start-assessment" data-assessment-id="${assessment._id}">
                  ${assessment.status === 'in-progress' ? 'Continue' : 'Start'}
                </button>`}
              ${assessment.grade ? 
                `<span class="ms-2 badge bg-info">Grade: ${assessment.grade}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getAssessmentBadgeClass(status) {
  switch (status) {
    case 'completed': return 'bg-success';
    case 'in-progress': return 'bg-warning text-dark';
    case 'pending': return 'bg-secondary';
    case 'overdue': return 'bg-danger';
    default: return 'bg-secondary';
  }
}