import { fetchCourseDetails, fetchAssessments, userData } from '../Data/data.js';

// Base API URL - defaults to localhost if not set in window.API_BASE_URL
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Renders detailed course information including resources, assessments, and submissions
export async function renderCourseDetails(contentArea, course) {
  // Show loading state while fetching data
  contentArea.innerHTML = `
    <div class="course-details-loading" style="
      text-align: center; 
      padding: 2rem; 
      color: white;">
      <h2>Loading Course Details...</h2>
    </div>
  `;

  try {
    // Fetch detailed course information including resources
    const courseDetails = await fetchCourseDetails(course._id);
    // Fetch assessments for this course
    const assessments = await fetchAssessments(course._id);

    // Render the course details page with tabs for resources, assessments, and submissions
    contentArea.innerHTML = `
      <style>
        .course-details-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
          min-height: 100vh;
        }
        
        .course-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .course-title {
          color: rgb(26, 115, 150);
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        .course-description {
          color: #4a5568;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .course-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .bg-primary {
          background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
          color: white;
        }
        
        .text-muted {
          color: #718096 !important;
        }
        
        .nav-tabs {
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }
        
        .nav-link {
          color: white;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          position: relative;
        }
        
        .nav-link.active {
          color: white;
          background: transparent;
          border: none;
        }
        
        .nav-link.active:after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: white;
          border-radius: 3px 3px 0 0;
        }
        
        .nav-link:hover {
          color: rgba(255, 255, 255, 0.8);
          border: none;
        }
        
        .tab-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
          color: rgb(26, 115, 150);
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .empty-message {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          color: #64748b;
          font-size: 1rem;
        }
        
        .resource-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .resource-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          padding: 1.5rem 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #e2e8f0;
        }
        
        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.1);
        }
        
        .folder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 0.8rem 1.2rem;
          background: linear-gradient(90deg, #1e88e5, #42a5f5);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }
        
        .folder-content {
          margin-top: 1rem;
        }
        
        .assessment-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          box-sizing: border-box;
          border: none;
        }
        
        .btn-primary {
          background: rgb(54, 126, 186);
          color: white;
        }
        
        .btn-primary:hover {
          background: rgb(21, 81, 133);
        }
        
        .btn-success {
          background: #38a169;
          color: white;
        }
        
        .btn-outline-primary {
          background: white;
          color: rgb(54, 126, 186);
          border: 1px solid rgb(54, 126, 186);
        }
        
        .btn-outline-primary:hover {
          background: #f7fafc;
        }
        
        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
          min-height: 36px;
        }
        
        .form-control {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .mb-3 {
          margin-bottom: 1rem;
        }
        
        .mt-2 {
          margin-top: 0.5rem;
        }
        
        .mt-3 {
          margin-top: 1rem;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table th, .table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        
        .table th {
          background: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
        
        @media (max-width: 768px) {
          .course-details-container {
            padding: 1rem;
          }
          
          .resource-grid {
            grid-template-columns: 1fr;
          }
          
          .course-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>
      
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
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="submissions-tab" data-bs-toggle="tab" data-bs-target="#submissions" type="button" role="tab">My Submissions</button>
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
              ${await renderAssessments(assessments || [], course._id)} <!-- Pass courseId to check submissions -->
            </div>
          </div>
          
          <!-- Submissions Tab -->
          <div class="tab-pane fade" id="submissions" role="tabpanel">
            <div class="submissions-container" id="submissionsContainer">
              <div class="loading-message">Loading your submissions...</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Initialize Bootstrap tabs if needed
    if (window.bootstrap) {
      new window.bootstrap.Tab(document.querySelector('#resources-tab'));
    }

    // Load submissions when submissions tab is clicked
    document.querySelector('#submissions-tab').addEventListener('click', async () => {
      await renderSubmissions(course._id, contentArea);
    });

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

    // Handle assessment submission form
    document.querySelectorAll('.assessment-submit-form').forEach(form => {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button to prevent multiple submissions
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const parent = form.closest('.assessment-submit-area');
        const fileInput = form.querySelector('input[type="file"]');
        const comment = form.querySelector('textarea').value;
        const assessmentItem = form.closest('.assessment-item');
        const assessmentId = assessmentItem.getAttribute('data-assessment-id');
        const courseId = course._id; // Use the course ID from the parent function
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const email = user.email || 'Unknown'; 
        const username = user.name || 'Anonymous';

        const submitTime = new Date().toISOString();

        // Validate file input
        if (!fileInput.files.length) {
          parent.querySelector('.submit-message').innerHTML = '<span style="color:red;">Please attach a file.</span>';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Assessment';
          return;
        }

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('comment', comment);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('courseId', courseId);
        formData.append('assessmentId', assessmentId);
        formData.append('submittedAt', submitTime);

        try {
          // Submit the assessment
          const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/submit`, {
            method: 'POST',
            body: formData
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Submission failed');
          }
          
          // Show success message
          parent.querySelector('.submit-message').innerHTML = '<span style="color:green;">Submitted successfully!</span>';
          form.reset();
          
          // Update the UI to show the assessment is submitted
          const startBtn = assessmentItem.querySelector('.start-assessment');
          if (startBtn) {
            startBtn.textContent = 'Already Submitted';
            startBtn.disabled = true;
            startBtn.classList.remove('btn-primary');
            startBtn.classList.add('btn-success');
          }
          
          // Hide the submission form after 3 seconds
          setTimeout(() => {
            parent.style.display = 'none';
            parent.querySelector('.submit-message').innerHTML = '';
          }, 3000);
        } catch (err) {
          // Show error message and re-enable submit button
          parent.querySelector('.submit-message').innerHTML = `<span style="color:red;">${err.message || 'Submission failed'}</span>`;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Assessment';
        }
      });
    });

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

    // Render quizzes after assessments
    await renderQuizzes(course._id);

    // Track resource actions (view/download)
    setTimeout(() => {
      document.querySelectorAll('.resource-actions a.primary-button').forEach(btn => {
        btn.addEventListener('click', function () {
          let actionType = 'resource_action';
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('view')) actionType = 'resource_view';
          else if (text.includes('download')) actionType = 'resource_download';
          else if (text.includes('open link') || text.includes('visit link')) actionType = 'resource_link_open';

          const resourceItem = btn.closest('.resource-item');
          const title = resourceItem ? resourceItem.querySelector('h4').textContent : '';
          
        });
      });
    }, 0);

    // Track time spent on course
    let startTime = new Date();
    window.addEventListener('beforeunload', () => {
      const endTime = new Date();
      const timeSpent = (endTime - startTime) / 1000;
  
    });

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

// Renders the submissions tab content
async function renderSubmissions(courseId, contentArea) {
  const submissionsContainer = contentArea.querySelector('#submissionsContainer');
  submissionsContainer.innerHTML = '<p>Loading your submissions...</p>';

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;
    
    if (!email) {
      submissionsContainer.innerHTML = '<div class="alert alert-warning">Please log in to view your submissions.</div>';
      return;
    }

    // Fetch submissions for this course and user
    const response = await fetch(`${API_BASE_URL}/course/${courseId}/${email}`);
    const submissions = await response.json();

    // Fetch assessments to get their titles
    const assessmentsResponse = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`);
    const assessments = await assessmentsResponse.json();

    if (!submissions || submissions.length === 0) {
      submissionsContainer.innerHTML = '<div class="empty-message">You have no submissions for this course yet.</div>';
      return;
    }

    // Render submissions table with delete buttons
    submissionsContainer.innerHTML = `
      <div class="submissions-list">
        <h3>Your Submissions</h3>
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Submitted At</th>
                <th>File</th>
                <th>Grade</th>
                <th>Feedback</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(sub => {
                const assessment = assessments.find(a => a._id === sub.assessmentId);
                const assessmentTitle = assessment ? assessment.title : 'Unknown Assessment';
                const fileUrl = sub.downloadUrl || 
                  (sub.filePath ? `${API_BASE_URL.replace('/api', '')}/${sub.filePath.replace(/\\/g, '/')}` : null);
                
                return `
                  <tr data-submission-id="${sub._id}">
                    <td>${assessmentTitle}</td>
                    <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                    <td>
                      ${fileUrl ? 
                        `<a href="${fileUrl}" download="${sub.originalFileName || 'submission'}" class="btn btn-sm btn-outline-primary">Download</a>` : 
                        'No file'}
                    </td>
                    <td>${sub.grade || 'Not graded'}</td>
                    <td>${sub.feedback || 'No feedback'}</td>
                    <td>
                      <span class="badge ${sub.grade ? 'bg-success' : 'bg-warning'}">
                        ${sub.grade ? 'Graded' : 'Submitted'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger delete-submission" 
                              data-submission-id="${sub._id}"
                              title="Delete submission">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Add event listeners for delete buttons
    submissionsContainer.querySelectorAll('.delete-submission').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const submissionId = button.dataset.submissionId;
        const row = button.closest('tr');
        
        if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
          try {
            const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
              method: 'DELETE'
            });

            if (response.ok) {
              row.remove();
              showToast('Submission deleted successfully', 'success');
              
              // If this was the last submission, show empty message
              if (submissionsContainer.querySelectorAll('tbody tr').length === 0) {
                submissionsContainer.innerHTML = '<div class="empty-message">You have no submissions for this course yet.</div>';
              }
            } else {
              throw new Error('Failed to delete submission');
            }
          } catch (error) {
            console.error('Error deleting submission:', error);
            showToast('Failed to delete submission', 'error');
          }
        }
      });
    });

  } catch (error) {
    console.error('Error loading submissions:', error);
    submissionsContainer.innerHTML = `
      <div class="alert alert-danger">
        Failed to load your submissions. Please try again later.
      </div>
    `;
  }
}

// Helper function to show toast notifications
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast show align-items-center text-white bg-${type}`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '1100';
  document.body.appendChild(container);
  return container;
}

// Renders course resources with styled folders
function renderResources(resources) {
  if (!resources || resources.length === 0) {
    return `
      <div class="empty-message">
        <p>No resources available for this course yet.</p>
      </div>
    `;
  }

  // Group resources by folder
  const folders = {};
  resources.forEach(res => {
    const folder = res.folder || "General";
    if (!folders[folder]) folders[folder] = [];
    folders[folder].push(res);
  });

  return `
    <div class="foldered-resources" style="margin-top: 1.5rem;">
      ${Object.keys(folders).map(folderName => `
        <div class="folder-section" style="margin-bottom:2.5rem;">
          <!-- Folder Header -->
          <div class="folder-header">
            <span><i class="fas fa-folder-open" style="margin-right:8px;"></i> ${folderName}</span>
            <i class="fas fa-chevron-down"></i>
          </div>

          <!-- Folder Content -->
          <div class="folder-content" style="display:none;">
            <div class="resource-grid">
              ${folders[folderName].map(resource => {
                const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
                const fileUrl = resource.filePath ? `${API_BASE_URL.replace('/api', '')}/${resource.filePath.replace(/\\/g, '/')}` : '';
                const canView = resource.filePath && ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
                const isVideoFile = resource.filePath && ['mp4', 'webm', 'ogg'].includes(ext);

                // YouTube
                let isYouTube = false;
                let youTubeEmbed = '';
                if (resource.link && (resource.link.includes('youtube.com') || resource.link.includes('youtu.be'))) {
                  isYouTube = true;
                  const url = resource.link;
                  const match = url.match(
                    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_\-]{11})/
                  );
                  if (match && match[1]) {
                    youTubeEmbed = `<iframe 
                      width="100%" 
                      height="200" 
                      src="https://www.youtube.com/embed/${match[1]}" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen 
                      style="border-radius:8px;">
                    </iframe>`;
                  }
                }

                return `
                  <div class="resource-card">
                    <div>
                      <h4 style="margin-bottom: 0.5rem; color: #1e88e5; font-weight: 600; font-size:1.1rem;">${resource.title}</h4>
                      <p class="resource-meta" style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.7rem;">
                        <span style="margin-right: 12px;"><i class="fas fa-tag"></i> ${resource.type}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${new Date(resource.createdAt).toLocaleDateString()}</span>
                      </p>
                      <p style="font-size: 0.95rem; color: #334155; margin-bottom: 1rem; line-height:1.4;">${resource.description || '<span style="color:#bbb;">No description</span>'}</p>
                    </div>

                    <div class="resource-actions" style="margin-bottom: 0.7rem;">
                      ${canView ? `<a href="${fileUrl}" target="_blank" class="btn btn-outline-primary btn-sm" style="margin-right:8px;">View</a>` : ''}
                      ${
                        resource.filePath && !isYouTube
                          ? `<a href="${API_BASE_URL}/resources/${resource._id}/download" class="btn btn-outline-secondary btn-sm" style="margin-right:8px;">Download</a>`
                          : ''
                      }
                    </div>

                    ${ext === 'pdf'
                      ? `<div style="margin-top:10px;">
                        <iframe src="${fileUrl}" width="100%" height="300" style="border-radius:8px; border:1px solid #eee;"></iframe>
                      </div>` : ''}

                    ${isVideoFile ? `
                      <video width="100%" height="200" controls style="margin-top:10px; border-radius:8px;">
                        <source src="${fileUrl}" type="video/${ext}">
                        Your browser does not support the video tag.
                      </video>
                    ` : ''}

                    ${isYouTube ? `
                      <div style="margin-top:10px;">
                        ${youTubeEmbed}
                      </div>
                    ` : ''}

                    ${resource.link && !isYouTube ? `
                      <div style="margin-top:10px;">
                        <a href="${resource.link}" target="_blank" style="color:#2563eb; font-weight:500;">🔗 Visit Link</a>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Renders assessments list with submission status check
 * @param {Array} assessments - Array of assessment objects
 * @param {string} courseId - The ID of the course
 * @returns {string} HTML string of rendered assessments
 */
async function renderAssessments(assessments, courseId) {
  if (assessments.length === 0) {
    return `
      <div class="empty-assessments">
        <p>No assessments available for this course yet.</p>
      </div>
    `;
  }

  // Get user submissions for this course
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const email = user.email;
  let userSubmissions = [];
  
  if (email) {
    try {
      const response = await fetch(`${API_BASE_URL}/course/${courseId}/${email}`);
      userSubmissions = await response.json();
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }

  let submitAreaId = 'assessment-submit-area';

  return `
    <div class="assessment-list">
      ${assessments.map(assessment => {
        // Check if user has already submitted this assessment
        const hasSubmitted = userSubmissions.some(sub => sub.assessmentId === assessment._id);
        
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
          const fileUrl = `${API_BASE_URL.replace('/api', '')}/${assessment.filePath.replace(/\\/g, '/')}`;
          const ext = assessment.originalName ? assessment.originalName.split('.').pop().toLowerCase() : '';
          const canView = ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
          if (canView) {
            fileLink = `<a href="${fileUrl}" target="_blank" class="btn btn-outline-info btn-sm" style="margin-left:8px;">View Attached File</a>`;
          } else {
            fileLink = `<a href="${fileUrl}" download class="btn btn-outline-info btn-sm" style="margin-left:8px;">Download Attached File</a>`;
          }
        }

        return `
          <div class="assessment-item" data-assessment-id="${assessment._id}" data-course-id="${courseId}">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h5 style="color: #2d3748; margin-bottom: 0.5rem;">${assessment.title}</h5>
                  <p style="color: #4a5568; margin-bottom: 0.5rem;">${assessment.description || 'No description provided'}</p>
                  ${fileLink}
                </div>
                <span class="badge ${getAssessmentBadgeClass(assessment.status)}">
                  ${assessment.status || 'Pending'}
                </span>
              </div>
              <div style="margin-top: 0.5rem;">
                <small class="text-muted ${dueClass}" style="margin-right: 1rem;">
                  <strong>Due:</strong> ${assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'No due date'}
                </small>
                <small class="text-muted">
                  <strong>Points:</strong> ${assessment.points || 'N/A'}
                </small>
              </div>
              <div style="margin-top: 1rem;">
                ${hasSubmitted ? 
                  `<button class="btn btn-success btn-sm" disabled>Already Submitted</button>` : 
                  assessment.status === 'completed' ? 
                    `<button class="btn btn-success btn-sm" disabled>Completed</button>` : 
                    `<button class="btn btn-primary btn-sm start-assessment" data-assessment-id="${assessment._id}">
                      ${assessment.status === 'in-progress' ? 'Continue' : 'Start'}
                    </button>`}
                ${assessment.grade ? 
                  `<span style="margin-left: 0.5rem;" class="badge bg-info">Grade: ${assessment.grade}</span>` : ''}
              </div>
              ${!hasSubmitted ? `
                <div id="${submitAreaId}-${assessment._id}" class="assessment-submit-area" style="display:none; margin-top:1rem;">
                  <form enctype="multipart/form-data" class="assessment-submit-form">
                    <div style="margin-bottom: 0.5rem;">
                      <label for="submissionFile-${assessment._id}" class="form-label">Attach your file:</label>
                      <input type="file" id="submissionFile-${assessment._id}" name="submissionFile" class="form-control" required>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                      <textarea class="form-control" name="submissionComment" placeholder="Add a comment (optional)"></textarea>
                    </div>
                    <button type="submit" class="btn btn-success btn-sm">Submit Assessment</button>
                    <button type="button" class="btn btn-secondary btn-sm cancel-submit" data-assessment-id="${assessment._id}" style="margin-left:8px;">Cancel</button>
                  </form>
                  <div class="submit-message" style="margin-top: 0.5rem;"></div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Returns the appropriate Bootstrap badge class based on assessment status
function getAssessmentBadgeClass(status) {
  switch (status) {
    case 'completed': return 'bg-success';
    case 'in-progress': return 'bg-warning text-dark';
    case 'pending': return 'bg-secondary';
    case 'overdue': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

// Renders quizzes for the course
async function renderQuizzes(courseId) {
  const quizzesContainerId = 'quizzesContainer';
  let quizzesContainer = document.getElementById(quizzesContainerId);
  if (!quizzesContainer) {
    const assessmentsTab = document.getElementById('assessmentsContainer');
    quizzesContainer = document.createElement('div');
    quizzesContainer.id = quizzesContainerId;
    assessmentsTab.appendChild(quizzesContainer);
  }
  quizzesContainer.innerHTML = '<p>Loading quizzes...</p>';

  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`);
    const quizzes = await res.json();
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      quizzesContainer.innerHTML = '<div class="empty-message">No quizzes for this course.</div>';
      return;
    }

    quizzesContainer.innerHTML = quizzes.map(quiz => `
      <div class="quiz-block card mb-4" data-quiz-id="${quiz._id}">
        <div class="card-body">
          <h5>${quiz.title}</h5>
          <button class="btn btn-primary btn-sm start-quiz-btn" data-quiz-id="${quiz._id}">Start Quiz</button>
          <div class="quiz-form-area" id="quiz-form-area-${quiz._id}" style="display:none; margin-top:1rem;">
            <form class="quiz-response-form" data-quiz-id=              ${quiz.questions.map((q, qIdx) => `
                <div class="mb-3">
                  <strong>Q${qIdx + 1}: ${q.question}</strong>
                  <div>
                    ${q.options.map((opt, oIdx) => `
                      <div class="form-check">
                        <input class="form-check-input" type="radio" 
                          name="question-${qIdx}" 
                          id="quiz-${quiz._id}-q${qIdx}-opt${oIdx}" 
                          value="${String.fromCharCode(65 + oIdx)}" required>
                        <label class="form-check-label" for="quiz-${quiz._id}-q${qIdx}-opt${oIdx}">
                          ${String.fromCharCode(65 + oIdx)}. ${opt}
                        </label>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
              <button type="submit" class="btn btn-success btn-sm">Submit Quiz</button>
              <button type="button" class="btn btn-secondary btn-sm cancel-quiz-btn" style="margin-left:8px;">Cancel</button>
              <div class="quiz-submit-message mt-2"></div>
            </form>
          </div>
        </div>
      </div>
    `).join('');

    // Start Quiz button logic
    quizzesContainer.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const quizId = btn.getAttribute('data-quiz-id');
  
        const formArea = document.getElementById(`quiz-form-area-${quizId}`);
        formArea.style.display = 'block';
        btn.style.display = 'none';
      });
    });

    // Cancel Quiz button logic
    quizzesContainer.querySelectorAll('.cancel-quiz-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const form = btn.closest('.quiz-response-form');
        const quizId = form.getAttribute('data-quiz-id');
        const formArea = document.getElementById(`quiz-form-area-${quizId}`);
        const startBtn = quizzesContainer.querySelector(`.start-quiz-btn[data-quiz-id="${quizId}"]`);
        formArea.style.display = 'none';
        startBtn.style.display = '';
        form.reset();
        form.querySelector('.quiz-submit-message').innerHTML = '';
      });
    });

    // Submit Quiz logic
    quizzesContainer.querySelectorAll('.quiz-response-form').forEach(form => {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const quizId = form.getAttribute('data-quiz-id');
        const quiz = quizzes.find(q => q._id === quizId);
        const answers = quiz.questions.map((q, qIdx) => {
          const selected = form.querySelector(`input[name="question-${qIdx}"]:checked`);
          return {
            question: q.question,
            answer: selected ? selected.value : ''
          };
        });

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const email = user.email;
        
        try {
          const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              courseId: courseId,
              answers
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Submission failed');
          form.querySelector('.quiz-submit-message').innerHTML = '<span style="color:green;">Quiz submitted!</span>';
          form.querySelectorAll('button[type="submit"]').forEach(btn => btn.disabled = true);

          // Auto-marking logic
          try {
            const quizRes = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`);
            const quizzesList = await quizRes.json();
            const submittedQuiz = quizzesList.find(q => q._id === quizId);

            if (submittedQuiz) {
              let correctCount = 0;
              submittedQuiz.questions.forEach((q, idx) => {
                const userAnswer = answers[idx]?.answer;
                if (userAnswer && userAnswer === q.correctAnswer) {
                  correctCount++;
                }
              });
              const total = submittedQuiz.questions.length;
              const grade = Math.round((correctCount / total) * 100);
              console.log(`Quiz ${quizId} graded: ${correctCount}/${total} (${grade}%)`);
              form.querySelector('.quiz-submit-message').innerHTML += `<br><span style="color:blue;">Grade: ${grade}% (${correctCount}/${total})</span>`;
              
              await fetch(`${API_BASE_URL}/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'quiz',
                  refId: quizId,
                  courseId: courseId,
                  email: email,
                  grade: grade,
                  feedback: `Auto-graded: ${correctCount} out of ${total} correct`
                })
              });
            }
          } catch (err) {
            // Optionally handle marking error
          }

          setTimeout(() => {
            const tabPane = form.closest('.tab-pane');
            if (tabPane) {
              tabPane.classList.remove('show', 'active');
              const resourcesTab = document.querySelector('#resources-tab');
              if (resourcesTab) resourcesTab.click();
            }
          }, 1200);
        } catch (err) {
          form.querySelectorAll('button[type="submit"]').forEach(btn => btn.disabled = true);
          form.querySelector('.quiz-submit-message').innerHTML = '<span style="color:red;">' + err.message + '</span>';
        }
      });
    });

  } catch (err) {
    quizzesContainer.innerHTML = '<div class="error-message">Failed to load quizzes.</div>';
  }
}

// Helper function to track user actions
function trackAction(actionType, data) {
  // Implementation depends on your analytics setup
  console.log(`Tracking: ${actionType}`, data);
}

// Helper function to navigate to a course
function goToCourse(courseTitle) {
  // Implementation depends on your routing setup
  console.log(`Navigating to course: ${courseTitle}`);
}