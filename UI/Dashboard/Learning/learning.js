import { fetchCourses, courses, userData } from '../Data/data.js';
import { renderCourseDetails } from '../Courses/Courses.js';
import { renderResources } from '../AdminDashboard/Resources.js';

import.meta.env; // Ensure Vite env is loaded

// Use API_BASE_URL from .env or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function renderLearningTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Learning Dashboard</h2>
      <p class="text-muted">Explore your courses and track your learning journey below.</p>
    </div>
    
    <!-- Available Courses Section -->
    <div class="section-title">Available Courses</div>
    <div class="card-container" id="availableCoursesContainer"></div>
    
    <!-- Enrolled Courses Section -->
    <div class="section-title">Enrolled Courses</div>
    <div class="card-container" id="enrolledCoursesContainer"></div>
  `;

  try {
    // Fetch courses and render available courses
    await fetchCourses();
    console.log("Fetched Courses:", courses);

    renderCourses(courses, "availableCoursesContainer");

    // Fetch and render enrolled courses
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

  container.innerHTML = ""; // Clear the container
  courseList.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-card-content">
        <h5>${course.courseName}</h5>
        <p>${course.courseDescription}</p>
        <p><strong>Author:</strong> ${course.authorEmail}</p>
        <p><strong>Course Code:</strong> ${course.courseCode}</p>
      </div>
      <button class="btn btn-primary enroll-btn" data-course-id="${course._id}">Enroll</button>
      <button class="btn btn-outline-secondary view-btn" data-course-id="${course._id}">View Details</button>
    `;
    
    // Add click handler for the entire card (excluding buttons)
    card.querySelector('.course-card-content').addEventListener("click", () => {
      renderCourseDetails(document.getElementById("contentArea"), course);
    });
    
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
    renderEmptyState("enrolledCoursesContainer", "User email is missing. Please log in.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mycourses/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch enrolled courses");
    }

    const enrolledCourses = await response.json();
    console.log("Enrolled Courses:", enrolledCourses);

    if (enrolledCourses.enrolledCourses && enrolledCourses.enrolledCourses.length > 0) {
      renderCourses(enrolledCourses.enrolledCourses, "enrolledCoursesContainer");
    } else {
      renderEmptyState("enrolledCoursesContainer", "You have not enrolled in any courses.");
    }
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses.");
  }
}

// Handle enroll button click
async function handleEnrollClick(event) {
  event.stopPropagation(); // Prevent triggering the card click event
  const courseId = event.target.dataset.courseId;
  // Get user details (example: from userData or session)
  const currentUser = userData.currentUser || {};
  const { name, email } = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : currentUser;

  if (!name || !email) {
    alert('User details are missing. Please log in.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mycourses/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, courseId }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorText = await response.text(); // Read the response as text
      throw new Error(errorText || 'Failed to enroll in the course');
    }

    alert('Enrolled successfully!');
    console.log('Enrollment response:', data);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    alert(error.message || 'Failed to enroll in the course');
  }
}

function renderEmptyState(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  container.innerHTML = `
    <div class="empty-state">
      <p>${message}</p>
    </div>
  `;
}