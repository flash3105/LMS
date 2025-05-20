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
      
      <div class="table-section">
        <div class="assessment-set-container">
          <h2>Current Assessments</h2>
          <div id="currentAssessments">
            <div class="empty-message">Select a course to view assessments</div>
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

  // Course select change handler
  const courseSelect = container.querySelector('#assessmentCourse');
  courseSelect.addEventListener('change', () => {
    renderAssessmentsTable(courseSelect.value);
  });
}