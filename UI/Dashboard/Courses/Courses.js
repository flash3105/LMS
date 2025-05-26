// Courses.js
import { fetchCourseDetails, fetchAssessments ,userData} from '../Data/data.js';

export async function renderCourseDetails(contentArea, course) {
  // Show loading state
  contentArea.innerHTML = `
    <div class="course-details-loading">
      <h2>Loading Course Details...</h2>
    </div>
  `;

  try {
    // Fetch detailed course information including resources
    const courseDetails = await fetchCourseDetails(course._id);
    // Fetch assessments for this course
    const assessments = await fetchAssessments(course._id);

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
              ${renderResources(courseDetails || [])}
            </div>
          </div>
          
          <!-- Assessments Tab -->
          <div class="tab-pane fade" id="assessments" role="tabpanel">
            <div class="assessments-container" id="assessmentsContainer">
              ${renderAssessments(assessments || [])}
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

  // Attach event listeners for the Start and Cancel buttons
  document.querySelectorAll('.start-assessment').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-assessment-id');
      document.getElementById('assessment-submit-area-' + id).style.display = 'block';
    });
  });
  document.querySelectorAll('.cancel-submit').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-assessment-id');
      document.getElementById('assessment-submit-area-' + id).style.display = 'none';
    });
  });
  document.querySelectorAll('.assessment-submit-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const parent = form.closest('.assessment-submit-area');
      const fileInput = form.querySelector('input[type="file"]');
      const comment = form.querySelector('textarea').value;
      const assessmentItem = form.closest('.assessment-item');
      const assessmentId = assessmentItem.getAttribute('data-assessment-id');
      const courseId = assessmentItem.getAttribute('data-course-id') || course._id; // fallback to current course
      const username = userData.email || 'Unknown'; // adjust as needed for your user context
      const submitTime = new Date().toISOString();

      if (!fileInput.files.length) {
        parent.querySelector('.submit-message').innerHTML = '<span style="color:red;">Please attach a file.</span>';
        return;
      }
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('comment', comment);
      formData.append('email', username);
      formData.append('courseId', courseId);
      formData.append('assessmentId', assessmentId);
      formData.append('submittedAt', submitTime);

      try {
        const res = await fetch(`http://localhost:5000/api/assessments/${assessmentId}/submit`, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Submission failed');
        parent.querySelector('.submit-message').innerHTML = '<span style="color:green;">Submitted successfully!</span>';
        form.reset();
        // Hide the submission area after a short delay
        setTimeout(() => {
          parent.style.display = 'none';
          parent.querySelector('.submit-message').innerHTML = '';
        }, 1200);
      } catch (err) {
        parent.querySelector('.submit-message').innerHTML = '<span style="color:red;">Submission failed.</span>';
      }
    });
  });
}

function renderResources(resources) {
  if (!resources || resources.length === 0) {
    return `
      <div class="empty-message">
        <p>No resources available for this course yet.</p>
      </div>
    `;
  }

  return resources.map(resource => {
    // Get the file extension
    const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
    // Only allow view for certain types
    const canView = ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
    const fileUrl = resource.filePath ? `http://localhost:5000/${resource.filePath.replace(/\\/g, '/')}` : '#';

    return `
      <div class="resource-item">
        <h4>${resource.title}</h4>
        <p class="resource-meta">Type: ${resource.type} • Added: ${new Date(resource.createdAt).toLocaleDateString()}</p>
        <p>${resource.description || 'No description'}</p>
        <div class="resource-actions">
          ${canView ? `<a href="${fileUrl}" target="_blank" class="primary-button" style="margin-right:8px;">View</a>` : ''}
          <a href="http://localhost:5000/api/resources/${resource._id}/download" class="primary-button" style="background:#4a5568;margin-right:8px;">Download</a>
          <button class="edit-resource" data-id="${resource._id}">Edit</button>
          <button class="delete-resource" data-id="${resource._id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderAssessments(assessments) {
  if (assessments.length === 0) {
    return `
      <div class="empty-assessments">
        <p>No assessments available for this course yet.</p>
      </div>
    `;
  }

  let submitAreaId = 'assessment-submit-area';

  return `
    <div class="assessment-list">
      ${assessments.map(assessment => {
        // Due date highlighting
        let dueClass = '';
        if (assessment.dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(assessment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            dueClass = 'due-passed';
          } else if (dueDate.getTime() === today.getTime()) {
            dueClass = 'due-today';
          }
        }

        // Show file link if filePath exists
        let fileLink = '';
        if (assessment.filePath) {
          const fileUrl = `http://localhost:5000/${assessment.filePath.replace(/\\/g, '/')}`;
          // Only allow view for certain types
          const ext = assessment.originalName ? assessment.originalName.split('.').pop().toLowerCase() : '';
          const canView = ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
          if (canView) {
            fileLink = `<a href="${fileUrl}" target="_blank" class="btn btn-outline-info btn-sm" style="margin-left:8px;">View Attached File</a>`;
          } else {
            fileLink = `<a href="${fileUrl}" download class="btn btn-outline-info btn-sm" style="margin-left:8px;">Download Attached File</a>`;
          }
        }

        return `
          <div class="assessment-item card mb-3" data-assessment-id="${assessment._id}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title">${assessment.title}</h5>
                  <p class="card-text">${assessment.description || 'No description provided'}</p>
                  ${fileLink}
                </div>
                <span class="badge ${getAssessmentBadgeClass(assessment.status)}">
                  ${assessment.status || 'Pending'}
                </span>
              </div>
              <div class="assessment-meta mt-2">
                <small class="text-muted me-3 ${dueClass}">
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
              <div id="${submitAreaId}-${assessment._id}" class="assessment-submit-area" style="display:none; margin-top:1rem;">
                <form enctype="multipart/form-data" class="assessment-submit-form">
                  <div class="mb-2">
                    <label for="submissionFile-${assessment._id}" class="form-label">Attach your file:</label>
                    <input type="file" id="submissionFile-${assessment._id}" name="submissionFile" class="form-control" required>
                  </div>
                  <div class="mb-2">
                    <textarea class="form-control" name="submissionComment" placeholder="Add a comment (optional)"></textarea>
                  </div>
                  <button type="submit" class="btn btn-success btn-sm">Submit Assessment</button>
                  <button type="button" class="btn btn-secondary btn-sm cancel-submit" data-assessment-id="${assessment._id}" style="margin-left:8px;">Cancel</button>
                </form>
                <div class="submit-message mt-2"></div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
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