import { fetchCourseDetails, fetchAssessments, userData } from '../Data/data.js';

// Base API URL - defaults to localhost if not set in window.API_BASE_URL
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

//Renders detailed course information including resources, assessments, and submissions
export async function renderCourseDetails(contentArea, course) {
  // Show loading state while fetching data
  contentArea.innerHTML = `
    <div class="course-details-loading">
      <h2>Loading Course Details...</h2>
    </div>
  `;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id;

  const response = await fetch(`${API_BASE_URL}/mycourses/${user.email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch enrolled courses");
    }

    const courses = await response.json();

    console.log("Enrolled Courses: ", courses);
    courses.enrolledCourses.forEach(course => {
      console.log("Course:", course.courseName, "Status:", course.status, "Progress:", course.progress);
    });

  //Fetches user by email
  const res = await fetch(`${API_BASE_URL}/email/${encodeURIComponent(user.email)}`);
  if (!res.ok) throw new Error('User not found');
  const userFromEmail = await res.json();
  console.log('Fetched user:', userFromEmail)

  //Fetches resource completion, resource ratings and resources asynchronously
  const [completionsRes, ratingsRes, resourcesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/resources/completions/${userFromEmail._id}`),
    fetch(`${API_BASE_URL}/resources/ratings/${userFromEmail._id}`),
    fetch(`${API_BASE_URL}/courses/${course._id}/resources`)
  ]);
  const resources = await resourcesRes.json();
  const completions = (await completionsRes.json()).filter(c =>
    resources.some(r => r._id === c.resource)
  );

  const ratings = (await ratingsRes.json()).filter(r =>
    resources.some(res => res._id === r.resource)
  );

  console.log('Completions JSON:', completions);
  console.log('Ratings JSON:', ratings);

  // Render resources
  resources.forEach(resource => {
    const completed = completions.some(c => c.resource === resource._id);
    const rating = ratings.find(r => r.resource === resource._id)?.rating;

    const parent = document.querySelector(`[data-resource-id="${resource._id}"]`);
    if (!parent) return;

    if (completed) {
      parent.querySelector('.mark-complete-btn').style.display = 'none';
      parent.querySelector('.rating-section').style.display = 'block';
    }

    if (rating) {
      parent.querySelector('.rating-input').value = rating;
      parent.querySelector('.submit-rating-btn').disabled = true;
    }
  });

  try {
    // Fetch detailed course information including resources
    const courseDetails = await fetchCourseDetails(course._id);
    // Fetch assessments for this course
    const assessments = await fetchAssessments(course._id);

    // Render the course details page with tabs for resources, assessments, and submissions
    contentArea.innerHTML = `

        <style>
        .course-details-container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
          min-height: 100vh;
        }
        
        .course-header {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .course-title {
          color: rgb(26, 115, 150);
          font-size: 1.5rem;
          margin-bottom: 0.8rem;
          font-weight: 700;
          line-height: 1.3;
        }
        
        .course-description {
          color: #4a5568;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1.2rem;
        }
        
        .course-meta {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 0.85rem;
        }
        
        .bg-primary {
          background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
          color: white;
        }
        
        .text-muted {
          color: #718096 !important;
          font-size: 0.9rem;
        }
        
        .nav-tabs {
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .nav-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .nav-tabs .nav-item {
          flex-shrink: 0;
        }
        
        .nav-link {
          color: white;
          font-weight: 500;
          padding: 0.8rem 1.2rem;
          border: none;
          background: transparent;
          position: relative;
          white-space: nowrap;
          font-size: 0.9rem;
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
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
          color: rgb(26, 115, 150);
          font-size: 1.3rem;
          margin-bottom: 1.2rem;
          padding-bottom: 0.4rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .empty-message {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .resource-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .resource-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #e2e8f0;
        }
        
        .resource-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.12);
        }
        
        .resource-card h4 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #1e88e5;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .resource-meta {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.7rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        
        .resource-meta span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        
        .folder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 0.8rem 1rem;
          background: linear-gradient(90deg, #1e88e5, #42a5f5);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
          touch-action: manipulation;
        }
        
        .folder-header:active {
          transform: scale(0.98);
        }
        
        .folder-content {
          margin-top: 1rem;
        }
        
        .assessment-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
          padding: 1.2rem;
          margin-bottom: 1.2rem;
          border: 1px solid #e2e8f0;
        }
        
        .assessment-item .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
          line-height: 1.3;
        }
        
        .assessment-meta {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        
        .assessment-meta small {
          font-size: 0.85rem;
        }
        
        .btn {
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          box-sizing: border-box;
          border: none;
          font-size: 0.9rem;
          touch-action: manipulation;
        }
        
        .btn:active {
          transform: scale(0.95);
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
          padding: 0.5rem 0.8rem;
          font-size: 0.85rem;
          min-height: 40px;
        }
        
        .form-control {
          padding: 0.7rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        
        .form-control:focus {
          border-color: #3182ce;
          outline: none;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.9rem;
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
          padding: 0.6rem;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          font-size: 0.9rem;
        }
        
        .table th {
          background: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
        
        .youtube-container {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 8px;
        }
        
        .youtube-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 8px;
        }
        
        /* Resource actions responsive layout */
        .resource-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
        }
        
        .resource-actions .btn {
          flex: 1;
          min-width: 80px;
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 768px) {
          .course-details-container {
            padding: 0.5rem;
            min-height: calc(100vh - 1rem);
          }

          .course-header {
            padding: 1rem;
            margin-bottom: 1rem;
          }
          
          .course-title {
            font-size: 1.3rem;
          }
          
          .course-description {
            font-size: 0.95rem;
          }

          .course-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .nav-tabs {
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
          }

          .nav-link {
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
          }

          .tab-content {
            padding: 1rem;
          }

          .resource-grid {
            gap: 0.8rem;
          }

          .resource-card {
            padding: 1rem;
          }

          .folder-header {
            font-size: 0.95rem;
            padding: 0.7rem 0.8rem;
          }

          .assessment-item {
            padding: 1rem;
          }
          
          .assessment-meta {
            margin-top: 0.8rem;
          }
          
          .assessment-actions {
            margin-top: 1rem;
          }
          
          .assessment-actions .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          /* Table mobile optimization */
          .table-responsive {
            font-size: 0.8rem;
          }
          
          .table th, .table td {
            padding: 0.4rem;
            min-width: 80px;
          }
          
          /* Form improvements for mobile */
          .form-control {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 0.8rem;
          }
          
          textarea.form-control {
            min-height: 100px;
          }
          
          /* Quiz form mobile optimization */
          .quiz-block {
            margin-bottom: 1rem;
          }
          
          .quiz-response-form .form-check {
            margin-bottom: 0.8rem;
          }
          
          .quiz-response-form .form-check-label {
            font-size: 0.9rem;
            line-height: 1.4;
            padding-left: 0.3rem;
          }
          
          /* Resource completion section */
          .resource-completion {
            margin-top: 1rem;
          }
          
          .rating-section {
            margin-top: 0.8rem;
          }
          
          .rating-section select,
          .rating-section button {
            margin-bottom: 0.5rem;
          }
          
          /* Status row mobile layout */
          .status-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .status-row span,
          .status-row button {
            width: 100%;
          }
          
          /* Video and media responsive */
          .youtube-container {
            margin-top: 0.8rem;
          }
          
          video {
            width: 100%;
            height: auto;
            max-height: 200px;
          }
          
          /* PDF iframe mobile optimization */
          iframe[src*=".pdf"] {
            height: 250px !important;
          }
          
          /* Submission form mobile */
          .assessment-submit-area {
            margin-top: 1rem;
          }
          
          .assessment-submit-form .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          /* Toast container mobile positioning */
          #toast-container {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            width: auto !important;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .course-details-container {
            padding: 0.25rem;
          }
          
          .course-header {
            padding: 0.8rem;
            border-radius: 8px;
          }
          
          .course-title {
            font-size: 1.2rem;
          }
          
          .tab-content {
            padding: 0.8rem;
            border-radius: 8px;
          }
          
          .resource-card,
          .assessment-item {
            padding: 0.8rem;
            border-radius: 8px;
          }
          
          .btn {
            font-size: 0.85rem;
            padding: 0.6rem 0.8rem;
          }
          
          .btn-sm {
            font-size: 0.8rem;
            padding: 0.5rem 0.6rem;
          }
          
          .folder-header {
            font-size: 0.9rem;
            padding: 0.6rem;
          }
          
          .table th, .table td {
            padding: 0.3rem;
            font-size: 0.75rem;
          }
        }

        /* Landscape orientation improvements */
        @media (max-width: 768px) and (orientation: landscape) {
          .course-details-container {
            padding: 0.5rem;
          }
          
          .course-header {
            padding: 1rem;
          }
          
          .resource-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .resource-card,
          .assessment-item,
          .course-header,
          .tab-content {
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .course-header,
          .tab-content,
          .resource-card,
          .assessment-item {
            background: #1a202c;
            color: #e2e8f0;
            border-color: #2d3748;
          }
          
          .course-title {
            color: #63b3ed;
          }
          
          .text-muted {
            color: #a0aec0 !important;
          }
          
          .empty-message {
            background: #2d3748;
            color: #a0aec0;
            border-color: #4a5568;
          }
          
          .form-control {
            background: #2d3748;
            color: #e2e8f0;
            border-color: #4a5568;
          }
          
          .table th {
            background: #2d3748;
            color: #e2e8f0;
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
              ${await renderAssessments(assessments || [], course._id)}
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

    const resourcesContainer = document.getElementById('resourcesContainer');

    // Apply completion & rating states
    resources.forEach(resource => {
      const parent = resourcesContainer.querySelector(`[data-resource-id="${resource._id}"]`);
      if (!parent) return;

      const completed = completions.some(c => c.resource === resource._id);
      const rating = ratings.find(r => r.resource === resource._id)?.rating;

      const completeBtn = parent.querySelector('.mark-complete-btn');
      const ratingSection = parent.querySelector('.rating-section');

      if (completed) {
        if (completeBtn) completeBtn.style.display = 'none';
        ratingSection.style.display = 'block';
        updateResourceUI(resource._id, true, rating);
      } else if (rating) {
        ratingSection.querySelector('.rating-input').value = rating;
        ratingSection.querySelector('.submit-rating-btn').disabled = true;
      }
    });

    // Event delegation for buttons inside resourcesContainer
    resourcesContainer.addEventListener('click', async (e) => {
      const target = e.target;
      const parent = target.closest('.resource-completion');
      if (!parent) return;
      const resourceId = parent.dataset.resourceId;
      const ratingSection = parent.querySelector('.rating-section');

      const res = await fetch(`${API_BASE_URL}/email/${encodeURIComponent(user.email)}`);
      if (!res.ok) throw new Error('User not found');
      const userFromEmail = await res.json();

      // Mark Complete
      if (target.classList.contains('mark-complete-btn')) {
        try {
          await fetch(`${API_BASE_URL}/resources/${resourceId}/complete`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userFromEmail._id })
          });
          updateResourceUI(resourceId, true);
        } catch (err) {
          console.error(err);
          showToast('Error marking complete', 'danger');
        }
      }

      // Mark Uncomplete
      if (target.classList.contains('mark-uncomplete-btn')) {
      try {
        await fetch(`${API_BASE_URL}/resources/${resourceId}/uncomplete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userFromEmail._id })
        });

        // Delete rating if it exists
        const ratingInputVal = ratingSection.querySelector('.rating-input').value;
        if (ratingInputVal) {
          await fetch(`${API_BASE_URL}/resources/${resourceId}/rating`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userFromEmail._id })
          });
        }

        updateResourceUI(resourceId, false);
      } catch (err) {
        console.error(err);
        showToast('Error marking uncomplete', 'danger');
      }
    }

    // Submit Rating
    if (target.classList.contains('submit-rating-btn')) {
      const ratingInput = parseInt(ratingSection.querySelector('.rating-input').value);
      if (!ratingInput || ratingInput < 1 || ratingInput > 5) {
        return showToast('Select a valid rating (1-5)', 'warning');
      }

      if (!userFromEmail || !userFromEmail._id) {
      return showToast('User not found', 'danger');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/resources/${resourceId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userFromEmail._id,
          rating: ratingInput,
          feedback: ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return showToast(data.error || 'Error submitting rating', 'danger');
      }

      updateResourceUI(resourceId, true, ratingInput);
      showToast('Rating submitted');
    } catch (err) {
      console.error(err);
      showToast('Error submitting rating', 'danger');
    }
  }

    // Change Rating
    if (target.classList.contains('change-rating-btn')) {
      ratingSection.style.display = 'block';
      ratingSection.querySelector('.submit-rating-btn').disabled = false;
    }
  });

  // Update UI function
  function updateResourceUI(resourceId, completed = false, rating = null) {
    const parent = document.querySelector(`[data-resource-id="${resourceId}"]`);
    if (!parent) return;

    const completeBtn = parent.querySelector('.mark-complete-btn');
    const ratingSection = parent.querySelector('.rating-section');

    // Remove old status row if exists
    const oldStatusRow = parent.querySelector('.status-row');
    if (oldStatusRow) oldStatusRow.remove();

    if (completed) {
      if (completeBtn) completeBtn.style.display = 'none';
      ratingSection.style.display = 'block';

      // Add status row
      let statusRow = document.createElement('div');
      statusRow.className = 'status-row d-flex align-items-center gap-2 mt-2';

      let completeMsg = document.createElement('span');
      completeMsg.className = 'completion-msg text-success fw-bold';
      completeMsg.textContent = 'Marked as completed';
      statusRow.appendChild(completeMsg);

      if (rating !== null) {
        let ratingMsg = document.createElement('span');
        ratingMsg.className = 'rating-msg text-primary fw-semibold';
        ratingMsg.textContent = `Rating: ${rating}`;
        statusRow.appendChild(ratingMsg);

        let changeBtn = document.createElement('button');
        changeBtn.className = 'btn btn-sm btn-outline-info ms-2 change-rating-btn';
        changeBtn.textContent = 'Change Rating';
        statusRow.appendChild(changeBtn);
      }

      let uncompleteBtn = document.createElement('button');
      uncompleteBtn.className = 'btn btn-sm btn-outline-danger ms-2 mark-uncomplete-btn';
      uncompleteBtn.textContent = 'Mark as Uncomplete';
      statusRow.appendChild(uncompleteBtn);

      parent.appendChild(statusRow);
      if (rating !== null) ratingSection.style.display = 'none';
    } else {
      if (completeBtn) completeBtn.style.display = 'inline-block';
      ratingSection.style.display = 'none';
      ratingSection.querySelector('.rating-input').value = '';
      ratingSection.querySelector('.submit-rating-btn').disabled = false;
    }

    if (rating !== null) {
      ratingSection.querySelector('.rating-input').value = rating;
      ratingSection.querySelector('.submit-rating-btn').disabled = true;
    }
  }
    
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
        const courseId = course._id;
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

    const response = await fetch(`${API_BASE_URL}/course/${courseId}/${email}`);
    const submissions = await response.json();

    const assessmentsResponse = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`);
    const assessmentsRaw = await assessmentsResponse.json();

    const assessments = assessmentsRaw && typeof assessmentsRaw === "object" && !Array.isArray(assessmentsRaw)
      ? Object.values(assessmentsRaw).flat()
      : Array.isArray(assessmentsRaw)
        ? assessmentsRaw
        : [];

    if (!submissions || submissions.length === 0) {
      submissionsContainer.innerHTML = '<div class="empty-message">You have no submissions for this course yet.</div>';
      return;
    }

    // Mobile-optimized submissions layout
    submissionsContainer.innerHTML = `
      <div class="submissions-list">
        <h3>Your Submissions</h3>
        <div class="submissions-mobile-cards">
          ${submissions.map(sub => {
            const assessment = assessments.find(a => a._id === sub.assessmentId);
            const assessmentTitle = assessment ? assessment.title : 'Unknown Assessment';
            const fileUrl = sub.downloadUrl || 
              (sub.filePath ? `${API_BASE_URL.replace('/api', '')}/${sub.filePath.replace(/\\/g, '/')}` : null);
            
            return `
              <div class="submission-card" data-submission-id="${sub._id}">
                <div class="submission-header">
                  <h4>${assessmentTitle}</h4>
                  <span class="badge ${sub.grade ? 'bg-success' : 'bg-warning'}">
                    ${sub.grade ? 'Graded' : 'Submitted'}
                  </span>
                </div>
                <div class="submission-details">
                  <div class="detail-row">
                    <span class="detail-label">Submitted:</span>
                    <span class="detail-value">${new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Grade:</span>
                    <span class="detail-value">${sub.grade || 'Not graded'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Feedback:</span>
                    <span class="detail-value">${sub.feedback || 'No feedback'}</span>
                  </div>
                </div>
                <div class="submission-actions">
                  ${fileUrl ? 
                    `<a href="${fileUrl}" download="${sub.originalFileName || 'submission'}" class="btn btn-sm btn-outline-primary">Download File</a>` : 
                    '<span class="no-file-text">No file</span>'}
                  <button class="btn btn-sm btn-outline-danger delete-submission" 
                          data-submission-id="${sub._id}"
                          title="Delete submission">
                    Delete
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <style>
        .submissions-mobile-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .submission-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
          padding: 1.2rem;
          border: 1px solid #e2e8f0;
        }
        
        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }
        
        .submission-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          line-height: 1.3;
          flex: 1;
        }
        
        .submission-details {
          margin-bottom: 1rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }
        
        .detail-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
          min-width: 80px;
          flex-shrink: 0;
        }
        
        .detail-value {
          color: #2d3748;
          font-size: 0.9rem;
          text-align: right;
          flex: 1;
          word-break: break-word;
        }
        
        .submission-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        
        .submission-actions .btn {
          flex: 1;
          min-width: 100px;
        }
        
        .no-file-text {
          color: #a0aec0;
          font-style: italic;
          font-size: 0.9rem;
          flex: 1;
          display: flex;
          align-items: center;
        }
        
        @media (max-width: 480px) {
          .submission-card {
            padding: 1rem;
          }
          
          .submission-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .submission-header h4 {
            font-size: 1rem;
          }
          
          .detail-row {
            flex-direction: column;
            gap: 0.2rem;
          }
          
          .detail-label {
            min-width: auto;
          }
          
          .detail-value {
            text-align: left;
          }
          
          .submission-actions {
            flex-direction: column;
          }
          
          .submission-actions .btn {
            width: 100%;
            min-width: auto;
          }
        }
        
        /* Dark mode support for submissions */
        @media (prefers-color-scheme: dark) {
          .submission-card {
            background: #1a202c;
            color: #e2e8f0;
            border-color: #2d3748;
          }
          
          .submission-header h4 {
            color: #e2e8f0;
          }
          
          .detail-label {
            color: #a0aec0;
          }
          
          .detail-value {
            color: #e2e8f0;
          }
          
          .no-file-text {
            color: #718096;
          }
        }
      </style>
    `;

    // Add event listeners for delete buttons
    submissionsContainer.querySelectorAll('.delete-submission').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const submissionId = button.dataset.submissionId;
        const card = button.closest('.submission-card');
        
        if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
          try {
            const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
              method: 'DELETE'
            });

            if (response.ok) {
              card.remove();
              showToast('Submission deleted successfully', 'success');
              
              if (submissionsContainer.querySelectorAll('.submission-card').length === 0) {
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

// Renders course resources with mobile-optimized folders
function renderResources(resources) {
  if (!resources || resources.length === 0) {
    return `
      <div class="empty-message">
        <p>No resources available for this course yet.</p>
      </div>
    `;
  }
  
  const folders = {};
  resources.forEach(res => {
    const folder = res.folder || "General";
    if (!folders[folder]) folders[folder] = [];
    folders[folder].push(res);
  });

  return `
    <div class="foldered-resources">
      ${Object.keys(folders).map(folderName => `
        <div class="folder-section">
          <div class="folder-header">
            <span><i class="fas fa-folder-open"></i> ${folderName}</span>
            <i class="fas fa-chevron-down"></i>
          </div>

          <div class="folder-content">
            <div class="resource-grid">
              ${folders[folderName].map(resource => {
                const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
                const fileUrl = resource.type === 'link' ? resource.link : resource.downloadUrl || '#';
                const canView = fileUrl && ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
                const isVideoFile = resource.filePath && ['mp4', 'webm', 'ogg'].includes(ext);
                
                let isYouTube = false;
                let youTubeEmbed = '';

                if (resource.link && (resource.link.includes('youtube.com') || resource.link.includes('youtu.be'))) {
                  isYouTube = true;

                  try {
                    const urlObj = new URL(resource.link);
                    const videoId = urlObj.searchParams.get("v") || resource.link.split("youtu.be/")[1]?.substring(0, 11);
                    const playlistId = urlObj.searchParams.get("list");

                    if (videoId) {
                      let embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      if (playlistId) {
                        embedUrl += `?list=${playlistId}`;
                      }

                      youTubeEmbed = `
                        <div class="youtube-container">
                          <iframe
                            src="${embedUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                          </iframe>
                        </div>
                      `;
                    }
                  } catch (e) {
                    console.error("Invalid YouTube URL:", resource.link);
                  }
                }

                return `
                  <div class="resource-card">
                    <div>
                      <h4>${resource.title}</h4>
                      <div class="resource-meta">
                        <span><i class="fas fa-tag"></i> ${resource.type}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${new Date(resource.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>${resource.description || '<span style="color:#bbb;">No description</span>'}</p>
                    </div>

                    <div class="resource-actions">
                      ${canView ? `<a href="${fileUrl}" target="_blank" class="btn btn-outline-primary btn-sm">View</a>` : ''}
                      ${resource.filePath && !isYouTube
                        ? `<a href="${API_BASE_URL}/resources/${resource._id}/download" class="btn btn-outline-secondary btn-sm">Download</a>`
                        : ''}
                    </div>

                    ${ext === 'pdf'
                      ? `<div style="margin-top:10px;">
                        <iframe src="${fileUrl}" width="100%" height="250" style="border-radius:8px; border:1px solid #eee;"></iframe>
                      </div>` : ''}

                    ${isVideoFile ? `
                      <video width="100%" controls style="margin-top:10px; border-radius:8px;">
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

                    <div class="resource-completion" data-resource-id="${resource._id}">
                      <button class="btn btn-sm btn-outline-success mark-complete-btn">Mark Complete</button>
                      <div class="rating-section mt-2" style="display:none;">
                        <label>Rate this resource:</label>
                        <select class="form-control rating-input">
                          <option value="">Select rating</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                        <button class="btn btn-sm btn-primary submit-rating-btn">Submit</button>
                      </div>
                    </div>
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

// Renders assessments with mobile optimization
async function renderAssessments(assessments, courseId) {
  if (assessments.length === 0) {
    return `<div class="empty-message"><p>No assessments available for this course yet.</p></div>`;
  }

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

  return `
    <div class="assessment-list">
      ${assessments.map(assessment => {
        const hasSubmitted = userSubmissions.some(sub => sub.assessmentId === assessment._id);
        
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

        let fileLink = '';
        const fileUrl = assessment.downloadUrl;
        
        if (assessment.filePath) {
          const ext = assessment.originalName ? assessment.originalName.split('.').pop().toLowerCase() : '';
          const canView = ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);
          if (canView) {
            fileLink = `<a href="${fileUrl}" target="_blank" class="btn btn-outline-info btn-sm">View File</a>`;
          } else {
            fileLink = `<a href="${fileUrl}" download class="btn btn-outline-info btn-sm">Download File</a>`;
          }
        }

        return `
          <div class="assessment-item" data-assessment-id="${assessment._id}" data-course-id="${courseId}">
            <div class="assessment-content">
              <div class="assessment-header">
                <h5>${assessment.title}</h5>
                <span class="badge ${getAssessmentBadgeClass(assessment.status)}">
                  ${assessment.status || 'Pending'}
                </span>
              </div>
              <p class="assessment-description">${assessment.description || 'No description provided'}</p>
              ${fileLink ? `<div class="assessment-file">${fileLink}</div>` : ''}
              <div class="assessment-meta">
                <div class="meta-item ${dueClass}">
                  <strong>Due:</strong> ${assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'No due date'}
                </div>
                <div class="meta-item">
                  <strong>Points:</strong> ${assessment.points || 'N/A'}
                </div>
              </div>
              <div class="assessment-actions">
                ${hasSubmitted ? 
                  `<button class="btn btn-success btn-sm" disabled>Already Submitted</button>` : 
                  assessment.status === 'completed' ? 
                    `<button class="btn btn-success btn-sm" disabled>Completed</button>` : 
                    `<button class="btn btn-primary btn-sm start-assessment" data-assessment-id="${assessment._id}">
                      ${assessment.status === 'in-progress' ? 'Continue' : 'Start'}
                    </button>`}
                ${assessment.grade ? 
                  `<span class="grade-badge">Grade: ${assessment.grade}</span>` : ''}
              </div>
              ${!hasSubmitted ? `
                <div id="assessment-submit-area-${assessment._id}" class="assessment-submit-area" style="display:none;">
                  <form enctype="multipart/form-data" class="assessment-submit-form">
                    <div class="form-group">
                      <label for="submissionFile-${assessment._id}" class="form-label">Attach your file:</label>
                      <input type="file" id="submissionFile-${assessment._id}" name="submissionFile" class="form-control" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Comment (optional):</label>
                      <textarea class="form-control" name="submissionComment" placeholder="Add a comment about your submission..."></textarea>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn btn-success">Submit Assessment</button>
                      <button type="button" class="btn btn-secondary cancel-submit" data-assessment-id="${assessment._id}">Cancel</button>
                    </div>
                  </form>
                  <div class="submit-message"></div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <style>
      .assessment-content {
        padding: 0;
      }
      
      .assessment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        gap: 1rem;
      }
      
      .assessment-header h5 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.3;
        flex: 1;
      }
      
      .assessment-description {
        color: #4a5568;
        margin-bottom: 1rem;
        line-height: 1.5;
      }
      
      .assessment-file {
        margin-bottom: 1rem;
      }
      
      .assessment-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .meta-item {
        font-size: 0.9rem;
        color: #4a5568;
      }
      
      .due-passed {
        color: #e53e3e !important;
        font-weight: 600;
      }
      
      .due-today {
        color: #d69e2e !important;
        font-weight: 600;
      }
      
      .grade-badge {
        background: #e6fffa;
        color: #00b3a6;
        padding: 0.3rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: 0.5rem;
      }
      
      .assessment-submit-area {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .submit-message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 6px;
      }
      
      @media (max-width: 480px) {
        .assessment-header {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .assessment-meta {
          gap: 0.3rem;
        }
        
        .form-actions {
          flex-direction: column;
        }
        
        .form-actions .btn {
          width: 100%;
        }
        
        .grade-badge {
          margin-left: 0;
          margin-top: 0.5rem;
          display: inline-block;
        }
      }
    </style>
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

// Renders quizzes for the course with mobile optimization
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

    quizzesContainer.innerHTML = `
      <div class="quizzes-section">
        <h3 class="section-title">Course Quizzes</h3>
        <div class="quiz-list">
          ${quizzes.map(quiz => `
            <div class="quiz-block" data-quiz-id="${quiz._id}">
              <div class="quiz-header">
                <h4>${quiz.title}</h4>
                <button class="btn btn-primary start-quiz-btn" data-quiz-id="${quiz._id}">Start Quiz</button>
              </div>
              <div class="quiz-form-area" id="quiz-form-area-${quiz._id}" style="display:none;">
                <form class="quiz-response-form" data-quiz-id="${quiz._id}">
                  <div class="quiz-questions">
                    ${quiz.questions.map((q, qIdx) => `
                      <div class="question-block">
                        <div class="question-text">
                          <strong>Question ${qIdx + 1}:</strong>
                          <span class="mathjax">${q.question}</span>
                        </div>
                        <div class="question-options">
                          ${q.options.map((opt, oIdx) => `
                            <label class="option-label">
                              <input type="radio" 
                                name="question-${qIdx}" 
                                value="${String.fromCharCode(65 + oIdx)}" 
                                required>
                              <span class="option-text mathjax">${String.fromCharCode(65 + oIdx)}. ${opt}</span>
                            </label>
                          `).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  <div class="quiz-actions">
                    <button type="submit" class="btn btn-success">Submit Quiz</button>
                    <button type="button" class="btn btn-secondary cancel-quiz-btn">Cancel</button>
                  </div>
                  <div class="quiz-submit-message"></div>
                </form>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <style>
        .quizzes-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .quiz-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .quiz-block {
          background: white;
          border-radius: 12px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;
        }
        
        .quiz-header h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d3748;
          flex: 1;
        }
        
        .quiz-form-area {
          margin-top: 1.5rem;
        }
        
        .quiz-questions {
          margin-bottom: 2rem;
        }
        
        .question-block {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1.2rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .question-text {
          margin-bottom: 1rem;
          font-size: 1rem;
          line-height: 1.5;
          color: #2d3748;
        }
        
        .question-options {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        
        .option-label {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 0.8rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        
        .option-label:hover {
          background: #f7fafc;
          border-color: #3182ce;
        }
        
        .option-label input[type="radio"] {
          margin: 0;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        
        .option-text {
          flex: 1;
          word-wrap: break-word;
        }
        
        .quiz-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .quiz-submit-message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .quiz-block {
            padding: 1.2rem;
          }
          
          .quiz-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .quiz-header .btn {
            width: 100%;
          }
          
          .question-block {
            padding: 1rem;
          }
          
          .option-label {
            padding: 0.7rem;
            font-size: 0.9rem;
          }
          
          .quiz-actions {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .quiz-actions .btn {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .quizzes-section {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
          }
          
          .quiz-block {
            padding: 1rem;
          }
          
          .quiz-header h4 {
            font-size: 1.1rem;
          }
          
          .question-text {
            font-size: 0.95rem;
          }
          
          .option-label {
            padding: 0.6rem;
            font-size: 0.85rem;
          }
        }
        
        /* Dark mode support for quizzes */
        @media (prefers-color-scheme: dark) {
          .quiz-block {
            background: #1a202c;
            color: #e2e8f0;
            border-color: #2d3748;
          }
          
          .quiz-header h4 {
            color: #e2e8f0;
          }
          
          .question-block {
            background: #2d3748;
            color: #e2e8f0;
            border-color: #4a5568;
          }
          
          .question-text {
            color: #e2e8f0;
          }
          
          .option-label {
            background: #1a202c;
            color: #e2e8f0;
            border-color: #4a5568;
          }
          
          .option-label:hover {
            background: #2d3748;
            border-color: #63b3ed;
          }
        }
      </style>
    `;

    // Render LaTeX with MathJax if available
    if (window.MathJax) {
      MathJax.typesetPromise();
    }

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

        const { email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;
        
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
          
          let message = `<span style="color:green;">Quiz submitted! Grade: ${data.grade}% (${data.correctCount}/${data.totalQuestions})</span>`;
          
          if (data.grade >= 80) {
            message += `<br><span style="color:gold; font-weight:bold;">🎉 Achievement unlocked! This score has been added to your milestones.</span>`;
          }
          
          form.querySelector('.quiz-submit-message').innerHTML = message;
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
            console.error('Error with auto-marking:', err);
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
    console.error('Error loading quizzes:', err);
    quizzesContainer.innerHTML = '<div class="error-message">Failed to load quizzes.</div>';
  }
}