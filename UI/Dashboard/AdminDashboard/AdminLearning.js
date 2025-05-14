import { fetchCourses } from '../Data/data.js';
import { courses } from '../Data/data.js';

function loadCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './AdminLearning.css'; 
  document.head.appendChild(link);
}

loadCSS();

export async function renderadminLearning(container, query = '') {
  try {
    // Fetch courses from API (with localStorage fallback)
    await fetchCourses();

    // Get courses from the global variable (populated by fetchCourses)
   
    const allCourses = courses && courses.length > 0 ? courses : [
      {
        id: '1',
        courseName: 'Introduction to Web Development',
        courseCode: 'WEB101',
        authorEmail: 'webdev@example.com',
        courseDescription: 'Learn the basics of HTML, CSS, and JavaScript.',
        visibility: 'public'
      },
      {
        id: '2',
        courseName: 'Advanced JavaScript',
        courseCode: 'JS201',
        authorEmail: 'js@example.com',
        courseDescription: 'Deep dive into JavaScript ES6+, async programming, and frameworks.',
        visibility: 'private'
      }
    ];
    
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
              <label for="courseDescription">Description*</label>
              <textarea id="courseDescription" placeholder="Detailed course description..." required></textarea>
            </div>
            
            <div class="form-group">
              <label>Visibility</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="visibility" value="public" checked />
                  Public (Visible to all users)
                </label>
                <label>
                  <input type="radio" name="visibility" value="private" />
                  Private (Only visible to enrolled users)
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
                  <button class="edit-btn" data-id="${course.id}">Edit</button>
                  <button class="delete-btn" data-id="${course.id}">Delete</button>
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

  if (courseName && courseCode && authorEmail && courseDescription) {
    try {
      const response = await fetch('http://localhost:5000/api/courses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseName,
          courseCode,
          authorEmail,
          courseDescription,
          visibility
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from backend
        if (data.errors) {
          const errorMessages = data.errors.map(err => err.msg).join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to add course');
      }

      // Refresh the course list
      const container = document.getElementById('contentArea');
      await renderadminLearning(container);
      
      // Clear the form
      document.getElementById('courseName').value = '';
      document.getElementById('courseCode').value = '';
      document.getElementById('authorEmail').value = '';
      document.getElementById('courseDescription').value = '';
      
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
  const courseToEdit = courses.find(course => course.id === courseId);
  
  if (courseToEdit) {
    // Populate the form with existing values
    document.getElementById('courseName').value = courseToEdit.title;
    document.getElementById('courseCode').value = courseToEdit.code;
    document.getElementById('authorEmail').value = courseToEdit.authorEmail;
    document.getElementById('courseDescription').value = courseToEdit.description;
    document.querySelector(`input[name="visibility"][value="${courseToEdit.visibility}"]`).checked = true;
    
    // Change the form to update mode
    const form = document.getElementById('courseForm');
    form.dataset.editMode = 'true';
    form.dataset.courseId = courseId;
    
    // Change the submit button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Course';
    
    // Scroll to the form
    form.scrollIntoView({ behavior: 'smooth' });
  }
}

async function handleDeleteCourse(event) {
  const courseId = event.target.dataset.id;
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
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




