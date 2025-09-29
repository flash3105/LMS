import { fetchCourses, courses, userData } from '../Data/data.js';
import { renderCourseDetails } from '../Courses/Courses.js';
import { renderResources } from '../AdminDashboard/Resources.js';

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Add mobile styles
const mobileStyles = `
/* Mobile-specific styles */
.mobile-container {
    display: none;
    min-height: 100vh;
}

.mobile-header {
    background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    padding: 20px 16px;
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.mobile-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.mobile-logo {
    font-weight: bold;
    font-size: 18px;
    color: white;
}

.mobile-profile-icon {
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
}

.mobile-welcome-text {
    font-size: 20px;
    font-weight: 300;
    margin-bottom: 4px;
    color: white;
}

.mobile-subtitle {
    font-size: 14px;
    opacity: 0.9;
    color: white;
}

.mobile-content {
    padding: 20px 16px;
}

.mobile-section {
    margin-bottom: 24px;
}

.mobile-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.mobile-section-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

.mobile-course-list {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.mobile-course-item {
    background: white;
    border-bottom: 1px solid #e9ecef;
    border-radius: 5px;
    margin-bottom: 15px;
    border-radius: 10px;
}

.mobile-course-item:last-child {
    border-bottom: none;
}

.mobile-course-header {
    padding: 20px 16px 16px;
    background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    color: white;
}

.mobile-course-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
}

.mobile-course-subtitle {
    font-size: 12px;
    opacity: 0.9;
    line-height: 1.3;
    color: yellow;
}

.mobile-course-body {
    padding: 16px;
}

@media (max-width: 768px) {
  .mobile-course-subtitle {
    display: none;
  }
}

.mobile-course-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: #666;
}

.mobile-course-actions {
    display: flex;
    gap: 8px;
}

.mobile-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    flex: 1;
    cursor: pointer;
}

.mobile-btn-primary {
    background: rgb(54, 126, 186);
    color: white;
}

.mobile-btn-outline {
    background: transparent;
    color: rgb(54, 126, 186);
    border: 1px solid rgb(54, 126, 186);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
    .learning-container {
        display: none;
    }
    
    .mobile-container {
        display: block;
    }
}

@media (min-width: 769px) {
    .mobile-container {
        display: none;
    }
}
`;

export async function renderLearningTab(contentArea) {
  contentArea.innerHTML = `
    <style>
      ${mobileStyles}
      
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
        max-height: 4.5em;
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

        .course-actions button {
          width: 100%;
        }

        .course-card h5 {
          font-size: 1.2rem;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .course-card-content {
          padding: 1rem;
        }

        .course-description:after {
          width: 50%;
        }
      }
    </style>
    
    <!-- Desktop View -->
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
    
    <!-- Mobile View -->
    <div class="mobile-container">
      <div class="mobile-header">
        <div class="mobile-header-top">
          <!-- Mobile header content can be added here if needed -->
        </div>
        <div class="mobile-subtitle">Explore your courses and track your learning journey</div>
      </div>
      
      <div class="mobile-content">
        <!-- Mobile Available Courses -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="mobile-section-title">Available Courses</div>
          </div>
          <div class="mobile-course-list" id="mobileAvailableCoursesList">
            <!-- Mobile available courses will be populated here -->
          </div>
        </div>
        
        <!-- Mobile Enrolled Courses -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="mobile-section-title">Enrolled Courses</div>
          </div>
          <div class="mobile-course-list" id="mobileEnrolledCoursesList">
            <!-- Mobile enrolled courses will be populated here -->
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    let currentUser = JSON.parse(localStorage.getItem("userData"));
    console.log("Current User:", currentUser);
    console.log("User Info:", currentUser.grade, currentUser.institution);
    await fetchCourses(currentUser.grade, currentUser.institution);
   
    // Render available courses (all courses that user is not enrolled in)
    renderAvailableCourses(courses, "availableCoursesContainer");
    await fetchEnrolledCourses();
    
    // Also render mobile courses
    renderMobileAvailableCourses(courses, "mobileAvailableCoursesList");
    await fetchMobileEnrolledCourses();
  } catch (error) {
    console.error("Error fetching or rendering courses:", error);
    renderEmptyState("availableCoursesContainer", "Failed to load available courses");
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses");
    renderMobileEmptyState("mobileAvailableCoursesList", "Failed to load available courses");
    renderMobileEmptyState("mobileEnrolledCoursesList", "Failed to load enrolled courses");
  }
}

// Render available courses (courses that user is not enrolled in)
function renderAvailableCourses(courseList, containerId) {
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
  
  // Filter out courses that user is already enrolled in
  const availableCourses = courseList.filter(course => !enrolledIds.includes(course._id));
  
  if (availableCourses.length === 0) {
    renderEmptyState(containerId, "No available courses to enroll in");
    return;
  }

  availableCourses.forEach(course => {
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
          <button class="enroll-btn" data-course-id="${course._id}">Enroll</button>
          <button class="view-btn" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    // Add event listener for view button
    const viewBtn = card.querySelector('.view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCourseDetails(document.getElementById("contentArea"), course);
      });
    }

    container.appendChild(card);
  });

  // Add event listeners to enroll buttons
  const enrollButtons = container.querySelectorAll('.enroll-btn');
  enrollButtons.forEach(button => {
    button.addEventListener('click', handleEnrollClick);
  });
}

// Render enrolled courses
function renderEnrolledCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  container.innerHTML = "";
  
  if (courseList.length === 0) {
    renderEmptyState(containerId, "You have not enrolled in any courses yet");
    return;
  }

  courseList.forEach(course => {
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
          <button class="view-btn" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    // Add event listener for view button
    const viewBtn = card.querySelector('.view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCourseDetails(document.getElementById("contentArea"), course);
      });
    }

    container.appendChild(card);
  });
}

// Render available courses for mobile view
function renderMobileAvailableCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = "";
  
  let enrolledIds = [];
  const enrolledData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
  if (enrolledData.enrolledCourses) {
    enrolledIds = enrolledData.enrolledCourses.map(c => typeof c === 'string' ? c : c._id);
  }

  // Filter out courses that user is already enrolled in
  const availableCourses = courseList.filter(course => !enrolledIds.includes(course._id));
  
  if (availableCourses.length === 0) {
    renderMobileEmptyState(containerId, "No available courses to enroll in");
    return;
  }

  availableCourses.forEach(course => {
    const courseItem = document.createElement("div");
    courseItem.className = "mobile-course-item";
    courseItem.innerHTML = `
      <div class="mobile-course-header">
        <div class="mobile-course-title">${course.courseName || course.title}</div>
        <div class="mobile-course-subtitle">${course.courseDescription || course.description || 'No description available'}</div>
      </div>
      <div class="mobile-course-body">
        <div class="mobile-course-meta">
          <span>Course Code: ${course.courseCode || 'N/A'}</span>
        </div>
        <div class="mobile-course-actions">
          <button class="mobile-btn mobile-btn-primary" data-course-id="${course._id}">Enroll</button>
          <button class="mobile-btn mobile-btn-outline" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    container.appendChild(courseItem);

    // Add event listeners
    const viewBtn = courseItem.querySelector('.mobile-btn-outline');
    if (viewBtn) {
      viewBtn.addEventListener('click', e => {
        e.stopPropagation();
        renderCourseDetails(document.getElementById("contentArea"), course);
      });
    }

    const enrollBtn = courseItem.querySelector('.mobile-btn-primary');
    if (enrollBtn) {
      enrollBtn.addEventListener('click', handleEnrollClick);
    }
  });
}

// Render enrolled courses for mobile view
function renderMobileEnrolledCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = "";
  
  if (courseList.length === 0) {
    renderMobileEmptyState(containerId, "You have not enrolled in any courses yet");
    return;
  }

  courseList.forEach(course => {
    const courseItem = document.createElement("div");
    courseItem.className = "mobile-course-item";
    courseItem.innerHTML = `
      <div class="mobile-course-header">
        <div class="mobile-course-title">${course.courseName || course.title}</div>
        <div class="mobile-course-subtitle">${course.courseDescription || course.description || 'No description available'}</div>
      </div>
      <div class="mobile-course-body">
        <div class="mobile-course-meta">
          <span>Course Code: ${course.courseCode || 'N/A'}</span>
        </div>
        <div class="mobile-course-actions">
          <button class="mobile-btn mobile-btn-outline" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    container.appendChild(courseItem);

    // Add event listeners
    const viewBtn = courseItem.querySelector('.mobile-btn-outline');
    if (viewBtn) {
      viewBtn.addEventListener('click', e => {
        e.stopPropagation();
        renderCourseDetails(document.getElementById("contentArea"), course);
      });
    }
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
      renderEnrolledCourses(enrolledCourses, "enrolledCoursesContainer");
    } else {
      renderEmptyState("enrolledCoursesContainer", "You have not enrolled in any courses yet");
    }
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses");
  }
}

async function fetchMobileEnrolledCourses() {
  const currentUser = userData.currentUser || {};
  const { email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;

  if (!email) {
    renderMobileEmptyState("mobileEnrolledCoursesList", "Please log in to view enrolled courses");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mycourses/${email}`);
    if (!response.ok) throw new Error("Failed to fetch enrolled courses");

    const userData = await response.json();
    const enrolledCourses = userData.enrolledCourses || [];

    if (enrolledCourses.length > 0) {
      renderMobileEnrolledCourses(enrolledCourses, "mobileEnrolledCoursesList");
    } else {
      renderMobileEmptyState("mobileEnrolledCoursesList", "You have not enrolled in any courses yet");
    }
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderMobileEmptyState("mobileEnrolledCoursesList", "Failed to load enrolled courses");
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
 
    // Refresh all course lists
    await fetchEnrolledCourses();
    await fetchMobileEnrolledCourses();
    
    // Refresh available courses
    renderAvailableCourses(courses, "availableCoursesContainer");
    renderMobileAvailableCourses(courses, "mobileAvailableCoursesList");
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

function renderMobileEmptyState(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div style="background: white; padding: 16px; text-align: center; color: #666; border-radius: 8px;">
        ${message}
      </div>
    `;
  }
}