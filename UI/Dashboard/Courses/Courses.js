// Courses.js
import { fetchCourseDetails, fetchAssessments ,userData} from '../Data/data.js';

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

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
      const username = userData.email || 'Unknown'; 
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
        const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/submit`, {
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

  // Add this function to render quizzes and handle responses
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
              <form class="quiz-response-form" data-quiz-id="${quiz._id}">
                ${quiz.questions.map((q, qIdx) => `
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
          // Track quiz start
          trackAction('quiz_start', { 
            courseId: course._id, 
            quizId: quizId 
          });
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
 const { email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;      // student's email
          try {
            // Updated submission path and payload
            const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
               email: email,           // student's email
                courseId: courseId,         // current course id
                answers                     // array of { question, answer }
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            form.querySelector('.quiz-submit-message').innerHTML = '<span style="color:green;">Quiz submitted!</span>';
            form.querySelectorAll('button[type="submit"]').forEach(btn => btn.disabled = true);

            // Auto-marking logic
            try {
              // Fetch quiz data to get correct answers
              const quizRes = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`);
              const quizzesList = await quizRes.json();
              const submittedQuiz = quizzesList.find(q => q._id === quizId);

              if (submittedQuiz) {
                // Calculate score
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
                // Save grade via Grades API
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

            // Close the quiz tab after a short delay
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

  // Call this after rendering assessments in renderCourseDetails:
  await renderQuizzes(course._id);

  // After rendering resources
  setTimeout(() => {
    document.querySelectorAll('.resource-actions a.primary-button').forEach(btn => {
      btn.addEventListener('click', function () {
        let actionType = 'resource_action';
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('view')) actionType = 'resource_view';
        else if (text.includes('download')) actionType = 'resource_download';
        else if (text.includes('open link') || text.includes('visit link')) actionType = 'resource_link_open';

        // Find the resource title for context
        const resourceItem = btn.closest('.resource-item');
        const title = resourceItem ? resourceItem.querySelector('h4').textContent : '';
        trackAction(actionType, { resourceTitle: title, resourceUrl: btn.href, courseId: course._id });
      });
    });
  }, 0);

  let startTime = new Date();
  window.addEventListener('beforeunload', () => {
    const endTime = new Date();
    const timeSpent = (endTime - startTime) / 1000; // seconds
    trackAction('time_spent', {
      courseId: course._id,
      seconds: timeSpent
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

  return `
    <div class="resource-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      ${resources.map(resource => {
        const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
        const fileUrl = resource.filePath ? `${API_BASE_URL.replace('/api', '')}/${resource.filePath.replace(/\\/g, '/')}` : '';
        const canView = resource.filePath && ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
        const isVideoFile = resource.filePath && ['mp4', 'webm', 'ogg'].includes(ext);

        // YouTube
        let isYouTube = false;
        let youTubeEmbed = '';
        if (resource.link && resource.link.includes('youtube.com')) {
          isYouTube = true;
          const match = resource.link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
          if (match && match[1]) {
            youTubeEmbed = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>`;
          }
        }

        return `
          <div class="resource-card" style="
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(30,136,229,0.07);
            padding: 1.5rem 1.2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 260px;
            position: relative;
            ">
            <div>
              <h4 style="margin-bottom: 0.5rem; color: #1e88e5; font-weight: 600;">${resource.title}</h4>
              <p class="resource-meta" style="font-size: 0.95rem; color: #666; margin-bottom: 0.5rem;">
                <span style="margin-right: 12px;"><i class="fas fa-tag"></i> ${resource.type}</span>
                <span><i class="fas fa-calendar-alt"></i> ${new Date(resource.createdAt).toLocaleDateString()}</span>
              </p>
              <p style="font-size: 1rem; color: #333; margin-bottom: 1rem;">${resource.description || '<span style="color:#bbb;">No description</span>'}</p>
            </div>
            <div class="resource-actions" style="margin-bottom: 0.7rem;">
              ${canView ? `<a href="${fileUrl}" target="_blank" class="btn btn-outline-primary btn-sm" style="margin-right:8px;">View</a>` : ''}
              ${
                resource.filePath && !(isYouTube)
                  ? `<a href="${API_BASE_URL}/resources/${resource._id}/download" class="btn btn-outline-secondary btn-sm" style="margin-right:8px;">Download</a>`
                  : ''
              }
            </div>
            ${
             ext === 'pdf'
              ? `<div style="margin-top:10px;">
               <iframe src="${fileUrl}" width="100%" height="300" style="border-radius:8px; border:1px solid #eee;"></iframe>
               </div>`
               : ''
               }
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
                <a href="${resource.link}" target="_blank" style="color:#3182ce;">Visit Link</a>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
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
          const fileUrl = `${API_BASE_URL.replace('/api', '')}/${assessment.filePath.replace(/\\/g, '/')}`;
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

async function trackAction(eventType, data) {
  try {
    const payload = {
      action: eventType,
      userId: userData._id || userData.email,
      timestamp: new Date().toISOString(),
      ...data
    };
    console.log('Sending analytics:', payload); // <-- Add this
    await fetch(`${API_BASE_URL}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Tracking failed:', err);
  }
}