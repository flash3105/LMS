import { fetchCourses, courses } from '../Data/data.js';

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

      <div class="table-section">
        <div class="assessment-set-container">
          <h2>Current Assessments</h2>
          <div id="currentAssessments">
            <div class="empty-message">Select a course to view assessments</div>
          </div>
        </div>
      </div>
      <div class="table-section">
        <div class="assessment-set-container">
          <h2>Current Quizzes</h2>
          <div id="currentQuizzes">
            <div class="empty-message">Select a course to view quizzes</div>
          </div>
        </div>
      </div>
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
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/assessments`, {
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
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/assessments`);
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
                    ${a.filePath ? `<a href="http://localhost:5000/${a.filePath.replace(/\\/g, '/')}" target="_blank">View</a>` : '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      tableDiv.innerHTML = '<div class="error-message">Failed to load assessments.</div>';
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
      const res = await fetch('http://localhost:5000/api/quizzes', {
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
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/quizzes`);
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
      const [grades, assessmentsRes, quizzesRes] = await Promise.all([
        fetchGradesForCourse(courseId),
        fetch(`http://localhost:5000/api/courses/${courseId}/assessments`).then(r => r.json()),
        fetch(`http://localhost:5000/api/courses/${courseId}/quizzes`).then(r => r.json())
      ]);
      // Render the grades table
      let gradesTableDiv = container.querySelector('#courseGradesTable');
      if (!gradesTableDiv) {
        gradesTableDiv = document.createElement('div');
        gradesTableDiv.id = 'courseGradesTable';
        container.appendChild(gradesTableDiv);
      }
      gradesTableDiv.innerHTML = `<h2>All Student Grades</h2>${renderCourseGradesTable(grades, assessmentsRes, quizzesRes)}`;
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
    const res = await fetch(`http://localhost:5000/api/grades/course/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch grades');
    return await res.json();
  }

  function renderCourseGradesTable(grades, assessments, quizzes, students) {
    // Combine all assessment and quiz IDs for this course
    const items = [
      ...assessments.map(a => ({ id: a._id, title: a.title, type: 'Assignment' })),
      ...quizzes.map(q => ({ id: q._id, title: q.title, type: 'Quiz' }))
    ];

    // Get unique student emails from grades
    const studentEmails = [...new Set(grades.map(g => g.email))];

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
            ${studentEmails.map(email => `
              <tr>
                <td>${email}</td>
                ${items.map(item => {
                  const gradeObj = grades.find(g => g.email === email && g.refId == item.id && g.type.toLowerCase() === item.type.toLowerCase());
                  return `<td>${gradeObj ? gradeObj.grade : '—'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}