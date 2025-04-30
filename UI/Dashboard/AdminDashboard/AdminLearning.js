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
    const allCourses = courses || [];
    const filteredCourses = allCourses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase())
    );

    container.innerHTML = `
      <h2>Learning Management</h2>
      <div class="admin-learning-container">
        <div class="add-course-section">
          <h3>${allCourses.length === 0 ? 'No Courses Found - Add Your First Course' : 'Add New Course'}</h3>
          <form id="courseForm">
            <input type="text" id="courseTitle" placeholder="Course Title" required />
            <textarea id="courseDescription" placeholder="Course Description" required></textarea>
            <button type="submit" class="primary-button">
              ${allCourses.length === 0 ? 'Create First Course' : 'Add Course'}
            </button>
          </form>
        </div>

        <div id="courseList" class="course-list">
          ${filteredCourses.length > 0 ? `
            <h3>${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'}</h3>
            ${filteredCourses.map(course => `
              <div class="course-card">
                <h4>${course.title}</h4>
                <p>${course.description}</p>
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
  const title = document.getElementById('courseTitle').value.trim();
  const description = document.getElementById('courseDescription').value.trim();

  if (title && description) {
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      // Refresh the course list from API
      const container = document.getElementById('contentArea');
      await renderadminLearning(container);
      
      // Clear the form
      document.getElementById('courseTitle').value = '';
      document.getElementById('courseDescription').value = '';
      
      // Show success message
      showToast('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      showToast('Failed to add course. Please try again.', 'error');
    }
  } else {
    showToast('Please fill in all fields', 'warning');
  }
}

async function handleEditCourse(event) {
  const courseId = event.target.dataset.id;
  // Implement your edit logic here
  // You might want to show a modal or convert the card to an editable form
  console.log('Edit course:', courseId);
}

async function handleDeleteCourse(event) {
  const courseId = event.target.dataset.id;
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