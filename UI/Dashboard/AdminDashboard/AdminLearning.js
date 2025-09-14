import { fetchCourses,userData } from '../Data/data.js';
import { courses } from '../Data/data.js';
import { renderResources } from './Resources.js';

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

let currentUser = JSON.parse(localStorage.getItem("userData")) ;

function loadCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './AdminLearning.css'; 
  document.head.appendChild(link);
}

loadCSS();

export async function renderadminLearning(container, query = '') {
  try {

      //console.log(currentUser.institution)
        await fetchCourses();
    // Fetch courses from API (with localStorage fallback)
    //await fetchCourses();

    // Get courses from the global variable (populated by fetchCourses)
    const allCourses = courses || [];
    const filteredCourses = allCourses.filter(course =>
      course.courseName.toLowerCase().includes(query.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(query.toLowerCase())
    );

    container.innerHTML = `
      <div class="admin-learning-container">
        <h2>Learning Management</h2>
        
        <!-- Add Course Button -->
        <button id="toggleAddCourse" class="primary-button">
          ${allCourses.length === 0 ? 'Add Your First Course' : 'Add New Course'}
        </button>
        
        <!-- Add Course Section -->
        <div class="add-course-section" id="addCourseSection" style="display: none;">
          <h3>${allCourses.length === 0 ? 'No Courses Found - Add Your First Course' : 'Add New Course'}</h3>
          <form id="courseForm">
            <div class="form-group">
              <label for="courseName">Course Name*</label>
              <input type="text" id="courseName" placeholder="Introduction to Web Development" required />
            </div>
            
            <div class="form-group">
              <label for="courseCode">Course Code*</label>
              <input type="text" id="courseCode" placeholder="WEB101" required />
            </div>
            
            <div class="form-group">
              <label for="authorEmail">Author Email*</label>
              <input type="email" id="authorEmail" placeholder="instructor@example.com" required />
            </div>
            <div class="form-group">
              <label for="grade">Grade Level*</label>
              <input type="number" id="grade" placeholder="1-12" min="1" max="12" required />
            </div>
            
            <div class="form-group">
              <label for="courseDescription">Description*</label>
              <textarea id="courseDescription" placeholder="Detailed course description..." required></textarea>
            </div>
            
            <div class="form-group">
              <label>Visibility</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="visibility" value="public" checked />
                  Public 
                </label>
                <label>
                  <input type="radio" name="visibility" value="private" />
                  Private 
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="primary-button">
                ${allCourses.length === 0 ? 'Create First Course' : 'Add Course'}
              </button>
              <button type="button" id="closeAddCourse" class="secondary-button">Close</button>
            </div>
          </form>
        </div>
        

        <!-- Course List -->
        <div id="courseList" class="course-list">
          ${filteredCourses.length > 0 ? `
            <h3>${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'}</h3>
            ${filteredCourses.map(course => `
              <div class="course-card">
                <h4>${course.courseName} (${course.courseCode})</h4>
                <p class="course-meta">Author: ${course.authorEmail} • ${course.visibility === 'public' ? 'Public' : 'Private'}</p>
                <p>${course.courseDescription}</p>
                <div class="course-actions">
                  <button class="edit-btn" data-id="${course._id}">Edit</button>
                  <button class="delete-btn" data-id="${course._id}">Delete</button>
                </div>
              </div>
            `).join('')}
          ` : `
            <div class="empty-state">
              <img src="/images/empty-courses.svg" alt="No courses" width="150">
              <p>No courses match your search</p>
              ${query ? '<button id="clearSearch" class="secondary-button">Clear Search</button>' : ''}
            </div>
          `}
        </div>
        </div>
      
    `;

    // Add event listener to toggle the Add Course section
    const toggleButton = container.querySelector('#toggleAddCourse');
    const addCourseSection = container.querySelector('#addCourseSection');
    toggleButton.addEventListener('click', () => {
      addCourseSection.style.display = addCourseSection.style.display === 'none' ? 'block' : 'none';
    });

    // Add event listener to close the Add Course section
    const closeButton = container.querySelector('#closeAddCourse');
    closeButton.addEventListener('click', () => {
      addCourseSection.style.display = 'none';
    });

    // Add event listener for the form submission
    // Add event listener for the form submission
        const form = container.querySelector('#courseForm');
        form.addEventListener('submit', handleCourseSubmit);

     


    // Add event listener for clear search button if it exists
    const clearSearchBtn = container.querySelector('#clearSearch');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => renderadminLearning(container, ''));
    }

    // Add event listeners for edit/delete buttons
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEditCourse);
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDeleteCourse);
    });

  } catch (error) {
    console.error('Error rendering learning admin:', error);
    container.innerHTML = `
      <div class="error-state">
        <h2>Learning Management</h2>
        <p>Failed to load courses. Please try again later.</p>
        <button id="retryLoading" class="primary-button">Retry</button>
      </div>
    `;
    
    container.querySelector('#retryLoading').addEventListener('click', () => renderadminLearning(container));
  }
}

async function handleCourseSubmit(event) {
  event.preventDefault();
  const courseName = document.getElementById('courseName').value.trim();
  const courseCode = document.getElementById('courseCode').value.trim();
  const authorEmail = document.getElementById('authorEmail').value.trim();
  const courseDescription = document.getElementById('courseDescription').value.trim();
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const grade = document.getElementById('grade').value.trim();

  // ✅ Correct way: fetch institution from localStorage
  const currentUser = JSON.parse(localStorage.getItem('userData'));
  const institution = currentUser?.institution || "General";

  console.log('Form values:', { courseName, courseCode, authorEmail, courseDescription, visibility, grade, institution });

  if (courseName && courseCode && authorEmail && courseDescription) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseName,
          courseCode,
          authorEmail,
          courseDescription,
          visibility,
          institution, // ✅ now dynamic, not always "General"
          grade
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = data.errors.map(err => err.msg).join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to add course');
      }

      // Refresh
      const container = document.getElementById('contentArea');
      await renderadminLearning(container);
      showToast('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      showToast(error.message || 'Failed to add course. Please try again.', 'error');
    }
  } else {
    showToast('Please fill in all required fields', 'warning');
  }
}


async function handleEditCourse(event) {
  const courseId = event.target.dataset.id;
  // Find the course in the courses array
  const courseToEdit = courses.find(course => course._id === courseId);

  if (courseToEdit) {
    // Route to Resources.js and render resources for this course
    const container = document.getElementById('contentArea');
    renderResources(container, courseToEdit);
  }
}

async function handleDeleteCourse(event) {
  const courseId = event.target.dataset.id;
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      // Refresh the course list
      const container = document.getElementById('contentArea');
      await renderadminLearning(container);
      showToast('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast('Failed to delete course', 'error');
    }
  }
}

// Helper function to show toast messages
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}