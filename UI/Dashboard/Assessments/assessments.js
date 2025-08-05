import { fetchCourses, courses } from '../Data/data.js';

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

function loadCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../Assessments/assessments.css';
  document.head.appendChild(link);
}

loadCSS();

export async function renderSetAssessment(container) {
  await fetchCourses();
  const allCourses = courses || [];

  container.innerHTML = `
    <div class="assessment-container">
      <!-- Set Assessment Section -->
      <div class="form-section">
        <div class="assessment-set-container">
          <h2>Set an Assessment</h2>
          <form id="setAssessmentForm" class="assessment-form" enctype="multipart/form-data">
            <div class="form-group">
              <label for="assessmentCourse">Course Name*</label>
              <select id="assessmentCourse" required>
                <option value="">Select a course</option>
                ${allCourses.map(course => `
                  <option value="${course._id}">${course.courseName} (${course.courseCode})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="assessmentTitle">Assessment Title*</label>
              <input type="text" id="assessmentTitle" required placeholder="e.g. Midterm Exam" />
            </div>
            <div class="form-group">
              <label for="assessmentDueDate">Due Date*</label>
              <input type="date" id="assessmentDueDate" required />
            </div>
            <div class="form-group">
              <label for="assessmentDescription">Description</label>
              <textarea id="assessmentDescription" placeholder="Assessment details..."></textarea>
            </div>
            <div class="form-group">
              <label for="assessmentFile">Attach Document</label>
              <input type="file" id="assessmentFile" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar" />
            </div>
            <button type="submit" class="primary-button">Create Assessment</button>
          </form>
          <div id="assessmentMessage"></div>
        </div>
      </div>

      <!-- Set Quiz Section -->
      <div class="form-section" style="margin-top:2rem;">
        <div class="assessment-set-container">
          <h2>Set a Quiz</h2>
          <form id="setQuizForm" class="assessment-form">
            <div class="form-group">
              <label for="quizCourse">Course Name*</label>
              <select id="quizCourse" required>
                <option value="">Select a course</option>
                ${allCourses.map(course => `
                  <option value="${course._id}">${course.courseName} (${course.courseCode})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="quizTitle">Quiz Title*</label>
              <input type="text" id="quizTitle" required placeholder="e.g. Chapter 1 Quiz" />
            </div>
            <div class="form-group">
              <label for="quizDueDate">Due Date*</label>
              <input type="date" id="quizDueDate" required />
            </div>
            <div id="quizQuestionsArea"></div>
            <button type="button" id="addQuizQuestion" class="primary-button" style="margin-bottom:10px;">Add Question</button>
            <button type="submit" class="primary-button">Create Quiz</button>
          </form>
          <div id="quizMessage"></div>
        </div>
      </div>

      <!-- View Submissions Section -->
      <div class="form-section" style="margin-top:2rem;">
        <div class="assessment-set-container">
          <h2>View Submissions</h2>
          <div class="form-group">
            <label for="submissionCourse">Select Course*</label>
            <select id="submissionCourse">
              <option value="">Select a course</option>
              ${allCourses.map(course => `
                <option value="${course._id}">${course.courseName} (${course.courseCode})</option>
              `).join('')}
            </select>
          </div>
          <div id="submissionsContent" style="margin-top: 1rem;">
            <div class="empty-message">Select a course to view submissions</div>
          </div>
        </div>
      </div>

      <!-- Assessments Table Section -->
      <div class="table-section">
        <div class="assessment-set-container">
          <h2>Current Assessments</h2>
          <div id="currentAssessments">
            <div class="empty-message">Select a course to view assessments</div>
          </div>
        </div>
      </div>

      <!-- Quizzes Table Section -->
      <div class="table-section">
        <div class="assessment-set-container">
          <h2>Current Quizzes</h2>
          <div id="currentQuizzes">
            <div class="empty-message">Select a course to view quizzes</div>
          </div>
        </div>
      </div>

      <!-- Grades Table -->
      <div id="courseGradesTable"></div>
    </div>
  `;





  // Form submission handler remains the same
  const form = container.querySelector('#setAssessmentForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseId = document.getElementById('assessmentCourse').value;
    const title = document.getElementById('assessmentTitle').value.trim();
    const dueDate = document.getElementById('assessmentDueDate').value;
    const description = document.getElementById('assessmentDescription').value.trim();
    const fileInput = document.getElementById('assessmentFile');
    const file = fileInput.files[0];

    if (!courseId || !title || !dueDate) {
      showAssessmentMessage('Please fill in all required fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('dueDate', dueDate);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create assessment');
      showAssessmentMessage('Assessment created successfully!', 'success');
      form.reset();
      renderAssessmentsTable(courseId);
    } catch (err) {
      showAssessmentMessage('Error: ' + err.message, 'error');
    }
  });

  function showAssessmentMessage(msg, type) {
    const msgDiv = container.querySelector('#assessmentMessage');
    msgDiv.textContent = msg;
    msgDiv.className = type === 'success' ? 'success-message' : 'error-message';
  }

  // Render assessments table function remains the same
 async function renderAssessmentsTable(courseId) {
  const tableDiv = container.querySelector('#currentAssessments');
  if (!courseId) {
    tableDiv.innerHTML = '<div class="empty-message">Select a course to view assessments</div>';
    return;
  }
  tableDiv.innerHTML = '<p>Loading assessments...</p>';
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`);
    const assessments = await res.json();
    if (!Array.isArray(assessments) || assessments.length === 0) {
      tableDiv.innerHTML = '<div class="empty-message">No assessments for this course.</div>';
      return;
    }
    tableDiv.innerHTML = `
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due Date</th>
              <th>Description</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            ${assessments.map(a => `
              <tr>
                <td>${a.title}</td>
                <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : ''}</td>
                <td>${a.description || ''}</td>
                <td>
                  ${a.filePath ? `<a href="${API_BASE_URL.replace('/api', '')}/${a.filePath.replace(/\\/g, '/')}" target="_blank">View</a>` : '—'}
                  <button class="btn btn-sm btn-outline-primary ms-2 edit-btn" data-id="${a._id}">Edit</button>
                  <button class="btn btn-sm btn-outline-danger ms-1 delete-btn" data-id="${a._id}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Attach event listeners after DOM update and successful fetch
    tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const assessmentId = btn.getAttribute('data-id');
        const assessment = assessments.find(a => a._id === assessmentId);
        if (assessment) {
          showEditModal(assessment, courseId);
        }
      });
    });

    tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const assessmentId = btn.getAttribute('data-id');
        const confirmed = confirm('Are you sure you want to delete this assessment?');
        if (confirmed) {
          try {
            const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, { method: 'DELETE' });
            if (res.ok) {
              alert('Assessment deleted.');
              renderAssessmentsTable(courseId); // Refresh
            } else {
              alert('Failed to delete assessment.');
            }
          } catch (err) {
            alert('Error deleting assessment.');
            console.error(err);
          }
        }
      });
    });

  } catch (err) {
    tableDiv.innerHTML = '<div class="error-message">Failed to load assessments.</div>';
  }
}


function showEditModal(assessment, courseId) {
  let modal = document.getElementById('editAssessmentModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editAssessmentModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form id="editAssessmentForm" enctype="multipart/form-data">
            <div class="modal-header">
              <h5 class="modal-title">Edit Assessment</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label for="editTitle" class="form-label">Title</label>
                <input type="text" id="editTitle" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="editDueDate" class="form-label">Due Date</label>
                <input type="date" id="editDueDate" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="editDescription" class="form-label">Description</label>
                <textarea id="editDescription" class="form-control" rows="3"></textarea>
              </div>

              <div class="mb-3">
                <label for="editFile" class="form-label">Replace Document (optional)</label>
                <input type="file" id="editFile" class="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bootstrap modal instance (requires Bootstrap 5)
    const bsModal = new bootstrap.Modal(modal);

    // Form submission logic
    modal.querySelector('#editAssessmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = modal.querySelector('#editTitle').value.trim();
      const dueDate = modal.querySelector('#editDueDate').value;
      const description = modal.querySelector('#editDescription').value.trim();
      const fileInput = modal.querySelector('#editFile');
      const file = fileInput.files[0];

      if (!title || !dueDate) {
        alert('Title and Due Date are required');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('dueDate', dueDate);
      formData.append('description', description);
      if (file) formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE_URL}/assessments/${assessment._id}`, {
          method: 'PUT',
          body: formData
        });

        if (!res.ok) throw new Error('Failed to update assessment');

        alert('Assessment updated successfully');
        bsModal.hide();
        renderAssessmentsTable(courseId);
      } catch (err) {
        alert('Error updating assessment: ' + err.message);
      }
    });

    // Store modal instance for reuse
    modal._bsModal = bsModal;
  }

  // Populate fields with assessment data
  modal.querySelector('#editTitle').value = assessment.title || '';
  modal.querySelector('#editDueDate').value = assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 10) : '';
  modal.querySelector('#editDescription').value = assessment.description || '';
  modal.querySelector('#editFile').value = ''; // reset file input

  modal._bsModal.show();
}


const submissionCourseSelect = container.querySelector('#submissionCourse');
  submissionCourseSelect.addEventListener('change', async () => {
    const courseId = submissionCourseSelect.value;
    if (!courseId) {
      container.querySelector('#submissionsContent').innerHTML = '<div class="empty-message">Select a course to view submissions</div>';
      return;
    }
    await renderSubmissions(courseId);
  });

    async function renderSubmissions(courseId) {
  const submissionsContent = container.querySelector('#submissionsContent');
  submissionsContent.innerHTML = '<p>Loading submissions...</p>';

  try {
    // Fetch assessments and submissions for this course
    const [assessments, submissions] = await Promise.all([
      fetch(`${API_BASE_URL}/courses/${courseId}/assessments`).then(r => r.json()),
      fetch(`${API_BASE_URL}/course/${courseId}`).then(r => r.json())
    ]);
    
    console.log('submissions', submissions);

    if ((!assessments || assessments.length === 0)) {
      submissionsContent.innerHTML = '<div class="empty-message">No assessments for this course.</div>';
      return;
    }

    // Mark assessments with type
    const allItems = [
      ...assessments.map(a => ({ ...a, type: 'assessment' }))
    ];

    // Group submissions by assessmentId
    const groupedSubmissions = {};
    submissions.forEach(sub => {
      if (!groupedSubmissions[sub.assessmentId]) {
        groupedSubmissions[sub.assessmentId] = [];
      }
      groupedSubmissions[sub.assessmentId].push(sub);
    });

    submissionsContent.innerHTML = `
      <div class="submissions-container">
        ${allItems.map(item => {
          const itemSubmissions = groupedSubmissions[item._id] || [];
          return `
            <div class="submission-item">
              <h3>${item.title} (${item.type === 'assessment' ? 'Assignment' : 'Quiz'})</h3>
              ${itemSubmissions.length > 0 ? `
                <table class="submissions-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Submitted At</th>
                      <th>File</th>
                      <th>Grade</th>
                      <th>Feedback</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemSubmissions.map(sub => `
                      <tr>
                        <td>${sub.email}</td>
                        <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                        <td>
                          ${sub.filePath ? `
                            <a href="${API_BASE_URL.replace('/api', '')}/${sub.filePath.replace(/\\/g, '/')}" 
                               download="${sub.email}_${item.title.replace(/[^a-z0-9]/gi, '_')}.${sub.filePath.split('.').pop()}" 
                               class="download-link">
                              Download
                            </a>
                          ` : 'No file'}
                        </td>
                        <td>
                          <input type="text" 
                                 class="grade-input" 
                                 data-submission-id="${sub._id}"
                                 value="${sub.grade || ''}" 
                                 placeholder="Enter grade" 
                                 style="width:60px;">
                        </td>
                        <td>
                          <textarea class="feedback-input" 
                                    data-submission-id="${sub._id}" 
                                    placeholder="Enter feedback"
                                    rows="2"
                                    style="width:150px;">${sub.feedback || ''}</textarea>
                        </td>
                        <td>
                          <button class="save-grade-btn" data-submission-id="${sub._id}">Save</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="empty-message">No submissions for this ${item.type === 'assessment' ? 'assignment' : 'quiz'}</div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add event listeners for save buttons
    submissionsContent.querySelectorAll('.save-grade-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const submissionId = btn.getAttribute('data-submission-id');
        const gradeInput = submissionsContent.querySelector(`.grade-input[data-submission-id="${submissionId}"]`);
        const feedbackInput = submissionsContent.querySelector(`.feedback-input[data-submission-id="${submissionId}"]`);
        const grade = gradeInput.value.trim();
        const feedback = feedbackInput.value.trim();

        if (!grade) {
          alert('Please enter a grade');
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grade, feedback })
          });

          if (!response.ok) {
            throw new Error('Failed to save grade and feedback');
          }

          alert('Grade and feedback saved successfully!');
        } catch (error) {
          console.error('Error saving grade and feedback:', error);
          alert('Error saving grade and feedback: ' + error.message);
        }
      });
    });

  } catch (error) {
    console.error('Error loading submissions:', error);
    submissionsContent.innerHTML = '<div class="error-message">Failed to load submissions. Please try again.</div>';
  }
}

  



  // --- QUIZ UI LOGIC ---
  const quizQuestionsArea = container.querySelector('#quizQuestionsArea');
  let quizQuestions = [];

  function renderQuizQuestions() {
    quizQuestionsArea.innerHTML = quizQuestions.map((q, idx) => `
      <div class="quiz-question-block" style="border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-bottom:10px;">
        <label>Question ${idx + 1}</label>
        <input type="text" class="quiz-question" data-idx="${idx}" value="${q.question || ''}" placeholder="Enter question" required style="width:100%;margin-bottom:6px;">
        <div>
          ${[0,1,2,3].map(optIdx => `
            <input type="text" class="quiz-option" data-idx="${idx}" data-opt="${optIdx}" value="${q.options[optIdx] || ''}" placeholder="Option ${String.fromCharCode(65+optIdx)}" required style="width:48%;margin-bottom:4px;">
          `).join('')}
        </div>
        <label>Correct Answer</label>
        <select class="quiz-correct" data-idx="${idx}" required>
          <option value="">Select</option>
          ${['A','B','C','D'].map((l, i) => `<option value="${l}" ${q.correctAnswer === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button type="button" class="remove-quiz-question" data-idx="${idx}" style="margin-left:10px;color:#e53e3e;background:none;border:none;cursor:pointer;">Remove</button>
      </div>
    `).join('');
  }

  container.querySelector('#addQuizQuestion').addEventListener('click', () => {
    quizQuestions.push({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    renderQuizQuestions();
  });

  quizQuestionsArea.addEventListener('input', (e) => {
    const idx = +e.target.getAttribute('data-idx');
    if (e.target.classList.contains('quiz-question')) {
      quizQuestions[idx].question = e.target.value;
    } else if (e.target.classList.contains('quiz-option')) {
      const opt = +e.target.getAttribute('data-opt');
      quizQuestions[idx].options[opt] = e.target.value;
    } else if (e.target.classList.contains('quiz-correct')) {
      quizQuestions[idx].correctAnswer = e.target.value;
    }
  });

  quizQuestionsArea.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-quiz-question')) {
      const idx = +e.target.getAttribute('data-idx');
      quizQuestions.splice(idx, 1);
      renderQuizQuestions();
    }
  });

  // Quiz form submission
  const quizForm = container.querySelector('#setQuizForm');
  quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseId = container.querySelector('#quizCourse').value;
    const title = container.querySelector('#quizTitle').value.trim();
    const dueDate = container.querySelector('#quizDueDate').value;

    // Validate questions and due date
    if (!courseId || !title || !dueDate || quizQuestions.length === 0 || quizQuestions.some(q => !q.question || q.options.some(opt => !opt) || !q.correctAnswer)) {
      showQuizMessage('Please fill in all quiz fields, add at least one question, and set a due date.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          dueDate,
          questions: quizQuestions
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create quiz');
      showQuizMessage('Quiz created successfully!', 'success');
      quizForm.reset();
      quizQuestions = [];
      renderQuizQuestions();
      renderQuizzesTable(courseId);
    } catch (err) {
      showQuizMessage('Error: ' + err.message, 'error');
    }
  });

  function showQuizMessage(msg, type) {
    const msgDiv = container.querySelector('#quizMessage');
    msgDiv.textContent = msg;
    msgDiv.className = type === 'success' ? 'success-message' : 'error-message';
  }

  // --- QUIZ TABLE ---
  async function renderQuizzesTable(courseId) {
    const tableDiv = container.querySelector('#currentQuizzes');
    if (!courseId) {
      tableDiv.innerHTML = '<div class="empty-message">Select a course to view quizzes</div>';
      return;
    }
    tableDiv.innerHTML = '<p>Loading quizzes...</p>';
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`);
      const quizzes = await res.json();
      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        tableDiv.innerHTML = '<div class="empty-message">No quizzes for this course.</div>';
        return;
      }
      tableDiv.innerHTML = `
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${quizzes.map((q, idx) => `
                <tr>
                  <td>${q.title}</td>
                  <td>${q.questions.length}</td>
                  <td>${q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    <button type="button" class="view-quiz-questions-btn" data-idx="${idx}">View Questions</button>
                  </td>
                </tr>
                <tr class="quiz-questions-row" id="quiz-questions-row-${idx}" style="display:none;">
                  <td colspan="4">
                    <div>
                      ${q.questions.map((ques, qIdx) => `
                        <div style="margin-bottom:10px;">
                          <strong>Q${qIdx + 1}:</strong> ${ques.question}<br>
                          <ul style="margin:0 0 0 20px;padding:0;">
                            ${ques.options.map((opt, oIdx) => `
                              <li${ques.correctAnswer === String.fromCharCode(65 + oIdx) ? ' style="font-weight:bold;color:#3182ce;"' : ''}>
                                ${String.fromCharCode(65 + oIdx)}. ${opt}
                                ${ques.correctAnswer === String.fromCharCode(65 + oIdx) ? ' <span style="color:#38a169;">(Correct)</span>' : ''}
                              </li>
                            `).join('')}
                          </ul>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Add event listeners for "View Questions" buttons
      tableDiv.querySelectorAll('.view-quiz-questions-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          const row = tableDiv.querySelector(`#quiz-questions-row-${idx}`);
          if (row.style.display === 'none') {
            row.style.display = '';
            btn.textContent = 'Hide Questions';
          } else {
            row.style.display = 'none';
            btn.textContent = 'View Questions';
          }
        });
      });
    } catch (err) {
      tableDiv.innerHTML = '<div class="error-message">Failed to load quizzes.</div>';
    }
  }

  // Course select change handler for assessments and quizzes
  const courseSelect = container.querySelector('#assessmentCourse');
  courseSelect.addEventListener('change', async () => {
    const courseId = courseSelect.value;
    renderAssessmentsTable(courseId);
    renderQuizzesTable(courseId);

    // Fetch grades, assessments, and quizzes for the course
    try {
      const [subResults,grades, assessmentsRes, quizzesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/course/${courseId}`).then(r => r.json()),
        fetchGradesForCourse(courseId),
        fetch(`${API_BASE_URL}/courses/${courseId}/assessments`).then(r => r.json()),
        fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`).then(r => r.json())
      ]);
      // Render the grades table
      let gradesTableDiv = container.querySelector('#courseGradesTable');
      if (!gradesTableDiv) {
        gradesTableDiv = document.createElement('div');
        gradesTableDiv.id = 'courseGradesTable';
        container.appendChild(gradesTableDiv);
      }
      gradesTableDiv.innerHTML = `<h2>All Student Grades</h2>${renderCourseGradesTable(subResults,grades, assessmentsRes, quizzesRes)}`;
    } catch (err) {
      // Optionally show error
    }
  });

  // Also update quizzes table when quiz course select changes
  const quizCourseSelect = container.querySelector('#quizCourse');
  quizCourseSelect.addEventListener('change', () => {
    renderQuizzesTable(quizCourseSelect.value);
  });

  // Initial render for quizzes table (empty)
  renderQuizQuestions();

  async function fetchGradesForCourse(courseId) {
    const res = await fetch(`${API_BASE_URL}/grades/course/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch grades');
    return await res.json();
  }
async function fetchAssessmentsGrades(email){
  const res = await fetch (`${API_BASE_URL}/graded/${email}/all`);
  if(!res.ok) throw new Error('Failed to fetch grades');
  return await res.json();
}
function renderCourseGradesTable(subResults, grades, assessments, quizzes) {
  const items = [
    ...assessments.map(a => ({ id: a._id, title: a.title, type: 'Assignment' })),
    ...quizzes.map(q => ({ id: q._id, title: q.title, type: 'Quiz' }))
  ];

  const subEmails = subResults.map(s => s.email);
  const gradeEmails = grades.map(g => g.email);
  const studentEmails = [...new Set([...subEmails, ...gradeEmails])];

  return `
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Student Email</th>
            ${items.map(item => `<th>${item.title} (${item.type})</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${studentEmails.map(email => {
            let hasLowGrade = false;

            const gradeCells = items.map(item => {
              let grade = null;

              if (item.type === 'Assignment') {
                const submission = subResults.find(sub => sub.email === email && sub.assessmentId === item.id);
                grade = submission && submission.grade != null ? Number(submission.grade) : null;
              } else {
                const gradeObj = grades.find(g => g.email === email && g.refId === item.id && g.type.toLowerCase() === 'quiz');
                grade = gradeObj && gradeObj.grade != null ? Number(gradeObj.grade) : null;
              }

              if (grade != null && grade < 50) hasLowGrade = true;

              return `<td>${grade != null ? grade : '—'}</td>`;
            }).join('');

            return `
              <tr style="${hasLowGrade ? 'background-color: #f8d7da;' : ''}">
                <td>${email}</td>
                ${gradeCells}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
}