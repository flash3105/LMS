import { fetchCourses, courses, userData } from '../Data/data.js';
import { renderCourseDetails } from '../Courses/Courses.js';
import { renderResources } from '../AdminDashboard/Resources.js';

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export async function renderLearningTab(contentArea) {
  contentArea.innerHTML = `
    <style>
      .learning-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      }
      
      .welcome {
        margin-bottom: 2.5rem;
        text-align: center;
      }
      
      .welcome h2 {
        color: rgb(26, 115, 150);
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .welcome p {
        color: rgb(39, 106, 177);
        font-size: 1.1rem;
      }
      
      .section-title {
        color: white;
        font-size: 1.5rem;
        margin: 2rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        border-left: none;
        
      }
      
      .card-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }
      
      .course-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(193, 24, 24, 0.05);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        flex-direction: column;
        height: 100%;
        border:none;
      }
      
      .course-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .course-card-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
  .course-card h5 {
        background: linear-gradient(135deg,rgb(125, 152, 173) 0%, #3182ce 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .course-card p {
        color: #4a5568;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 0.75rem;
      }
      
      .course-card p strong {
        color: #2d3748;
      }
      
      .course-description {
        flex: 1;
        overflow: hidden;
        position: relative;
        max-height: 4.5em; /* Show about 3 lines of text */
        line-height: 1.5em;
      }
      
      .course-description:after {
        content: "";
        text-align: right;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 30%;
        height: 1.5em;
        background: linear-gradient(to right, rgba(255, 255, 255, 0), white 50%);
      }
      
      .course-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #edf2f7;
      }
      
      .enroll-btn, .view-btn {
        flex: 1;
        padding: 0.5rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
      }
      
      .enroll-btn {
        background: rgb(54, 126, 186);
        color: white;
        border: none;
      }
      
      .enroll-btn:hover {
        background: rgb(21, 81, 133);
      }
      
      .view-btn {
        background: white;
        color: rgb(54, 126, 186);
        border: 1px solid rgb(54, 126, 186);
      }
      
      .view-btn:hover {
        background: #f7fafc;
      }
      
      .empty-state {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        color: #718096;
        grid-column: 1 / -1;
      }
      
      @media (max-width: 768px) {
        .card-container {
          grid-template-columns: 1fr;
        }
        
        .course-actions {
          flex-direction: column;
        }
      }
    </style>
    
    <div class="learning-container">
      <div class="welcome">
        <h2>Learning Dashboard</h2>
        <p>Explore your courses and track your learning journey below.</p>
      </div>
      
      <!-- Available Courses Section -->
      <div class="section-title">Available Courses</div>
      <div class="card-container" id="availableCoursesContainer"></div>
      
      <!-- Enrolled Courses Section -->
      <div class="section-title">Enrolled Courses</div>
      <div class="card-container" id="enrolledCoursesContainer"></div>
    </div>
  `;

  try {
    await fetchCourses();
   
    renderCourses(courses, "availableCoursesContainer");
    await fetchEnrolledCourses();
  } catch (error) {
    console.error("Error fetching or rendering courses:", error);
    renderEmptyState("availableCoursesContainer", "Failed to load available courses");
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses");
  }
}

function renderCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  let enrolledIds = [];
  const enrolledData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
  if (enrolledData.enrolledCourses) {
    enrolledIds = enrolledData.enrolledCourses.map(c => typeof c === 'string' ? c : c._id);
  }

  container.innerHTML = "";
  courseList.forEach(course => {
    const isEnrolled = enrolledIds.includes(course._id);

    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-card-content">
        <h5>${course.courseName || course.title}</h5>
        <div class="course-description">
          ${course.courseDescription || course.description || 'No description available'}
        </div>
        <p><strong>Author:</strong> ${course.authorEmail || 'Unknown'}</p>
        ${course.courseCode ? `<p><strong>Code:</strong> ${course.courseCode}</p>` : ''}
        <div class="course-actions">
          ${!isEnrolled ? `<button class="enroll-btn" data-course-id="${course._id}">Enroll</button>` : ''}
          <button class="view-btn" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    // Add click handler for the view details button
    card.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      renderCourseDetails(document.getElementById("contentArea"), course);
    });

    container.appendChild(card);
  });

  // Add event listeners to enroll buttons
  const enrollButtons = container.querySelectorAll('.enroll-btn');
  enrollButtons.forEach(button => {
    button.addEventListener('click', handleEnrollClick);
  });
}

async function fetchEnrolledCourses() {
  const currentUser = userData.currentUser || {};
  const { email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;

  if (!email) {
    renderEmptyState("enrolledCoursesContainer", "Please log in to view enrolled courses");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mycourses/${email}`);
    if (!response.ok) throw new Error("Failed to fetch enrolled courses");

    const userData = await response.json();
    const enrolledCourses = userData.enrolledCourses || [];
   

    if (enrolledCourses.length > 0) {
      renderCourses(enrolledCourses, "enrolledCoursesContainer");
    } else {
      renderEmptyState("enrolledCoursesContainer", "You have not enrolled in any courses yet");
    }
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses");
  }
}

async function handleEnrollClick(event) {
  event.stopPropagation();
  const courseId = event.target.dataset.courseId;
  const currentUser = userData.currentUser || {};
  const { name, email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;

  if (!name || !email) {
    alert('Please log in to enroll in courses');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mycourses/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, courseId }),
    });

    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to enroll');
    }

    const data = await response.json();
    alert('Enrolled successfully!');
 
    await fetchEnrolledCourses(); // Refresh enrolled courses list
  } catch (error) {
    console.error('Error enrolling:', error);
    alert(error.message || 'Failed to enroll');
  }
}

function renderEmptyState(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
  }
}