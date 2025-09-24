import { renderCourseDetails } from '../Courses/Courses.js';
import { fetchCourses, fetchUserData, fetchMessages, courses, userData, messages } from '../Data/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.email;

  await fetchCourses(); // Wait for courses to load
  //await fetchUserData(); // Wait for user data to load
  await fetchMessages(userId);
  console.log("User Data:", fetchUserData());
  // Now render, when data is ready
  renderHomeTab(document.getElementById('contentArea'), user);
});

let enrolledCoursesFromAPI = [];

// Add this CSS to your existing styles in renderHomeTab function
const mobileStyles = `
/* Mobile-specific styles */
.mobile-container {
    display: none;
   /* background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);*/
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
    color: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);;
}

.mobile-add-btn {
    background: rgb(54, 126, 186);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
}

.mobile-todo-list {
    background: white;
    border-left: 4px solid rgb(54, 126, 186);
    padding: 16px;
}

.mobile-todo-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.mobile-todo-item:last-child {
    margin-bottom: 0;
    border-bottom: none;
}

.mobile-todo-content {
    flex: 1;
}

.mobile-todo-title {
    font-size: 14px;
    color: #2c3e50;
    line-height: 1.4;
    margin-bottom: 4px;
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
            /* rounded corners */

             margin-bottom: 15px; 

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

.mobile-progress-container {
    margin-bottom: 16px;
}

.mobile-progress-text {
    font-size: 12px;
    color: #666;
    margin-bottom: 6px;
}

.mobile-progress-bar {
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
}

.mobile-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgb(54, 126, 186) 0%, rgb(125, 152, 173) 100%);
    border-radius: 3px;
    transition: width 0.3s ease;
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

.mobile-stats-list {
    display: flex;
    flex-direction: column;
    background: white;
}

.mobile-stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e9ecef;
}

.mobile-stat-item:last-child {
    border-bottom: none;
}

.mobile-stat-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.mobile-stat-number {
    font-size: 18px;
    font-weight: 700;
    color: rgb(54, 126, 186);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
    .home-container {
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

// Updated renderHomeTab function
export function renderHomeTab(contentArea, currentUser) {
  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
    courseProgress: {},
  };

  // Filter enrolled courses
  const enrolledCourses = courses.filter(course =>
    userProgress.enrolledCourses.includes(course.title)
  );

  // Get recent messages
  const recentMessages = messages.slice(0, 2); // Show only the latest 2 messages

  // Render both desktop and mobile content
  contentArea.innerHTML = `
    <style>
      ${mobileStyles}
      
      .home-container {
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
       color:rgb(26, 115, 150);
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .welcome p {
        color:rgb(39, 106, 177);
        font-size: 1.1rem;
      }
      
      .section-title {
        color: white;
        font-size: 1.5rem;
        margin: 2rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .card-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;
      }
      
      @media (max-width: 768px) {
        .card-container {
          grid-template-columns: 1fr;
        }
        
        .course-actions {
          flex-direction: column;
        }
      }
      
      .course-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex;
        flex-direction: column;
        height: 100%;
        border: none;
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
        background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.2rem;
        margin: 0;
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
        margin-bottom: 1rem;
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
      
      .progress-container {
        margin: 1rem 0;
      }
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #4a5568;
      }
      
      .progress-bar {
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #3182ce 60%, #63b3ed 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      
      .course-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #edf2f7;
        align-items: stretch;
      }
      
      .continue-btn, .view-btn {
        flex: 1;
        padding: 0.75rem 0.5rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        box-sizing: border-box;
        border: none;
      }
      
      .continue-btn {
        background: rgb(54, 126, 186);
        color: white;
      }
      
      .continue-btn:hover {
        background: rgb(21, 81, 133);
      }
      
      .view-btn {
        background: white;
        color: rgb(54, 126, 186);
        border: 1px solid rgb(54, 126, 186) !important;
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
      
      .statistics {
        margin: 2rem 0;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-top: 1rem;
      }
      
      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        text-align: center;
      }
      
      .stat-card h4 {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      
      .stat-card p {
        color:rgb(72, 53, 45);
        font-size: 1.5rem;
        font-weight: bold;
      }
      
      .todo-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
      }
      
      .todo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .todo-header h3 {
        color: #2d3748;
      }
      
      .add-task-btn {
        background: rgb(54, 126, 186);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .add-task-btn:hover {
        background: rgb(21, 81, 133);
      }
      
      .recent-messages {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-top: 2rem;
      }
      
      .message-preview {
        border-bottom: 1px solid #e2e8f0;
        padding: 1rem 0;
      }
      
      .message-preview:last-child {
        border-bottom: none;
      }
      
      .message-preview h5 {
        color: #2d3748;
        margin-bottom: 0.5rem;
      }
      
      .message-preview p {
        color: #4a5568;
        margin-bottom: 0.5rem;
      }
      
      .message-preview small {
        color: #718096;
      }
    </style>
    
    <!-- Desktop View -->
    <div class="desktop-container">
      <div class="home-container">
        <div class="welcome">
          <h2>Hello ${currentUser.name}! Set your plan for the day.</h2>
          <p>Track your learning, manage your tasks, and stay up to date.</p>
        </div>
        
        <div class="todo-section">
          <div class="todo-header">
            <h3>Todo</h3>
            <button class="add-task-btn">
              <i class="fas fa-plus"></i> Add Task
            </button>
          </div>
          
          <div class="todo-form" style="display:none;">
            <input type="text" class="task-input" placeholder="Task name">
            
            <div class="form-row">
              <div class="form-group">
                <label>Assignee</label>
                <select class="assignee-select">
                  <option value="${currentUser.name}">Me (${currentUser.name})</option>
                  <option value="Team">Team</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Due Date</label>
                <input type="date" class="due-date-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Priority</label>
                <select class="priority-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Status</label>
                <select class="status-select">
                  <option value="on-track">On track</option>
                  <option value="at-risk">At risk</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            
            <div class="course-selection">
              <label>Course</label>
              <select class="course-select">
                <option value="">None</option>
                ${enrolledCoursesFromAPI.map(course => 
                  `<option value="${course.title || course.courseName}">${course.title || course.courseName}</option>`
                ).join('')}
              </select>
            </div>
            
            <button class="submit-task-btn">Set</button>
          </div>
          
          <div class="task-list">
            <!-- Tasks will appear here dynamically -->
          </div>
        </div>
        
        <div class="section-title">Enrolled Courses</div>
        <div class="card-container" id="enrolledCoursesContainer"></div>
        
        <div class="statistics">
          <h2 class="section-title" style="color:white">Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h4>Courses Enrolled</h4>
              <p id="coursesEnrolledStat"></p>
            </div>
            <div class="stat-card">
              <h4>Courses Completed</h4>
              <p>${userProgress.completedCourses.length}</p>
            </div>
            <div class="stat-card">
              <h4>Assessments Due</h4>
              <p>${enrolledCourses.flatMap(course =>
                course.assessments?.filter(a => a.status === 'Upcoming') || []
              ).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile View -->
    <div class="mobile-container">
      <div class="mobile-header">
        <div class="mobile-header-top">
        <!--  <div class="mobile-logo">INURTURE</div>-->
           <!--<div class="mobile-profile-icon">${currentUser.name.charAt(0).toUpperCase()}</div>-->
        </div>
         <!--<div class="mobile-welcome-text">Hello ${currentUser.name}!</div>-->
        <div class="mobile-subtitle">Set your plan for the day.</div>
      </div>
      
      <div class="mobile-content">
        <!-- Mobile Todo Section -->
        <div class="mobile-section">
<!-- Mobile Add Task Form (hidden initially) -->
<div class="mobile-todo-form" style="display:none; padding:16px; background:white; border-radius:8px; margin-bottom:16px;">
  <input type="text" class="mobile-task-input" placeholder="Task name" style="width:100%; margin-bottom:8px;">
  <input type="date" class="mobile-due-date-input" style="width:100%; margin-bottom:8px;">
  <select class="mobile-priority-select" style="width:100%; margin-bottom:8px;">
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
  <button class="mobile-submit-task-btn" style="width:100%; background:rgb(54,126,186); color:white; padding:8px; border:none; border-radius:6px;">Add</button>
</div>
          <div class="mobile-section-header">
            <div class="mobile-section-title">Today</div>
            <button class="mobile-add-btn">Add Task</button>
          </div>
          <div class="mobile-todo-list" id="mobileTodoList">
            <!-- Mobile todos will be populated here -->
          </div>
        </div>
        
        <!-- Mobile Enrolled Courses -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="mobile-section-title">Enrolled Courses</div>
          </div>
          <div class="mobile-course-list" id="mobileCourseList">
            <!-- Mobile courses will be populated here -->
          </div>
        </div>
        
        <!-- Mobile Statistics -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <div class="mobile-section-title">Statistics</div>
          </div>
          <div class="mobile-stats-list" id="mobileStatsList">
            <div class="mobile-stat-item">
              <div class="mobile-stat-label">Courses Enrolled</div>
              <div class="mobile-stat-number" id="mobileCoursesEnrolledStat">0</div>
            </div>
            <div class="mobile-stat-item">
              <div class="mobile-stat-label">Courses Completed</div>
              <div class="mobile-stat-number">${userProgress.completedCourses.length}</div>
            </div>
            <div class="mobile-stat-item">
              <div class="mobile-stat-label">Assessments Due</div>
              <div class="mobile-stat-number">${enrolledCourses.flatMap(course =>
                course.assessments?.filter(a => a.status === 'Upcoming') || []
              ).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup both desktop and mobile functionality
  fetchEnrolledCourses();
  setupTodoFunctionality();
  setupMobileTodoFunctionality();
  loadTodos();
  loadMobileTodos();
}

function setupTodoFunctionality() {
  const addBtn = document.querySelector('.add-task-btn');
  const todoForm = document.querySelector('.todo-form');
  const submitBtn = document.querySelector('.submit-task-btn');
  const taskList = document.querySelector('.task-list');

  // Make sure we found the elements
  if (!addBtn || !todoForm || !submitBtn || !taskList) {
    console.error("Couldn't find all required elements!");
    return;
  }

  // Toggle form visibility 
  addBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    todoForm.style.display = todoForm.style.display === 'none' ? 'block' : 'none';
  });

  submitBtn.addEventListener('click', async () => {
    const taskInput = document.querySelector('.task-input');
    const assignee = document.querySelector('.assignee-select').value;
    const dueDate = document.querySelector('.due-date-input').value;
    const priority = document.querySelector('.priority-select').value;
    const status = document.querySelector('.status-select').value;
    const course = document.querySelector('.course-select').value;
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user.email;

    if (taskInput.value.trim()) {
      const todoData = {
        task: taskInput.value.trim(),
        assignee,
        dueDate,
        priority,
        status,
        course
      };

      // Send to API
      try {
        await fetch(`${API_BASE_URL}/todos/${email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todoData)
        });
      } catch (err) {
        console.error('Failed to save todo:', err);
      }

      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';
      
      // Format date for display
      const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date';
      
      taskItem.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox">
          <span class="task-text">${taskInput.value.trim()}</span>
          <div class="task-meta">
            <span class="task-meta-item"><i class="fas fa-user"></i> ${assignee}</span>
            <span class="task-meta-item"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
            <span class="task-meta-item priority-${priority}">${priority}</span>
            <span class="task-meta-item status-${status}">${status}</span>
            ${course ? `<span class="task-meta-item"><i class="fas fa-book"></i> ${course}</span>` : ''}
          </div>
        </div>
        <button class="delete-task"><i class="fas fa-trash"></i></button>
      `;

      taskList.appendChild(taskItem);
      
      // Clear form
      taskInput.value = '';
      document.querySelector('.due-date-input').value = '';
      todoForm.style.display = 'none';

      // Add event listeners
      taskItem.querySelector('.delete-task').addEventListener('click', () => {
        taskItem.remove();
      });

      const checkbox = taskItem.querySelector('.task-checkbox');
      checkbox.addEventListener('change', async (e) => {
        const newStatus = e.target.checked ? 'done' : 'on-track'; // or keep previous status if you want
        if (e.target.checked) {
          taskItem.style.opacity = '0.6';
          taskItem.querySelector('.task-text').style.textDecoration = 'line-through';
          const statusBadge = taskItem.querySelector('.status-done, .status-at-risk, .status-on-track');
          if (statusBadge) {
            statusBadge.className = 'task-meta-item status-done';
            statusBadge.textContent = 'done';
          }
        } else {
          taskItem.style.opacity = '1';
          taskItem.querySelector('.task-text').style.textDecoration = 'none';
        }

        // Send PATCH/PUT request to API to update status
        try {
          await fetch(`${API_BASE_URL}/todos/${todo._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
        } catch (err) {
          console.error('Failed to update todo status:', err);
        }
      });
    }
  });
}

// Add mobile todo functionality
function setupMobileTodoFunctionality() {
  const mobileAddBtn = document.querySelector('.mobile-add-btn');
  const mobileForm = document.querySelector('.mobile-todo-form');
  const mobileSubmitBtn = document.querySelector('.mobile-submit-task-btn');

  if (mobileAddBtn && mobileForm && mobileSubmitBtn) {
    mobileAddBtn.addEventListener('click', () => {
      mobileForm.style.display = mobileForm.style.display === 'none' ? 'block' : 'none';
    });

    mobileSubmitBtn.addEventListener('click', async () => {
      const taskInput = document.querySelector('.mobile-task-input');
      const dueDate = document.querySelector('.mobile-due-date-input').value;
      const priority = document.querySelector('.mobile-priority-select').value;

      const user = JSON.parse(localStorage.getItem('user'));
      const email = user.email;

      if (taskInput.value.trim()) {
        const todoData = {
          task: taskInput.value.trim(),
          assignee: user.name,
          dueDate,
          priority,
          status: 'on-track',
          course: '' // or allow course selection if you want
        };

        try {
          await fetch(`${API_BASE_URL}/todos/${email}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todoData)
          });

          // reload mobile todos
          loadMobileTodos();
          taskInput.value = '';
          document.querySelector('.mobile-due-date-input').value = '';
          mobileForm.style.display = 'none';
        } catch (err) {
          console.error('Failed to save mobile todo:', err);
        }
      }
    });
  }
}


// Mobile-specific functions
function openMobileAddTaskModal() {
  // You can reuse your existing modal or create a mobile-specific one
  const existingModal = document.querySelector('.todo-form');
  if (existingModal) {
    existingModal.style.display = existingModal.style.display === 'none' ? 'block' : 'none';
  }
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

    const user = await response.json();
    console.log("Fetched user for enrolled courses:", user);
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      enrolledCoursesFromAPI = user.enrolledCourses;
      renderCourses(user.enrolledCourses, "enrolledCoursesContainer");
      renderMobileCourses(user.enrolledCourses); // Add this line
    } else {
      enrolledCoursesFromAPI = [];
      renderEmptyState("enrolledCoursesContainer", "You have not enrolled in any courses.");
    }

    // After rendering, update the stats
    updateEnrolledCoursesStat();
    updateMobileEnrolledCoursesStat(); // Add this line
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses.");
  }
}

function renderCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const progressData = (userData[user.email] && userData[user.email].courseProgress) || {};

  // Removed duplicate courses by title/courseName
  const uniqueCoursesMap = new Map();
  courseList.forEach(course => {
    const key = course.title || course.courseName;
    if (!uniqueCoursesMap.has(key)) uniqueCoursesMap.set(key, course);
  });
  const uniqueCourses = Array.from(uniqueCoursesMap.values());

  // Creates cards in-memory first (to reduce reflows)
  const fragment = document.createDocumentFragment();

  uniqueCourses.forEach(course => {
    const courseKey = course.title || course.courseName;
    const progress = progressData[courseKey] || 0;
    const hoursSpent = Math.floor(progress / 20);

    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-card-content">
        <h5>${courseKey}</h5>
        <div class="course-description">
          ${course.description || course.courseDescription || 'No description available'}
        </div>
        ${course.authorEmail ? `<p><strong>Author:</strong> ${course.authorEmail}</p>` : ""}
        ${course.courseCode ? `<p><strong>Course Code:</strong> ${course.courseCode}</p>` : ""}
        <div>
          <div class="progress-info">
            <span class="progress-text">0% Complete</span>
            <span class="hours-text">${hoursSpent} hrs spent</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="course-actions">
          <button class="continue-btn" data-course-key="${courseKey}">Continue</button>
          <button class="view-btn" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    fragment.appendChild(card);

    // Attach buttons after card creation
    card.querySelector('.view-btn').addEventListener('click', e => {
      e.stopPropagation();
      renderCourseDetails(document.getElementById("contentArea"), course);
    });

    card.querySelector('.continue-btn').addEventListener('click', e => {
      e.stopPropagation();
      goToCourse(courseKey);
    });
  });

  container.appendChild(fragment);

  // Fetch all course data in parallel to avoid sequential requests
  const email = user.email;
  const userPromise = fetch(`${API_BASE_URL}/email/${encodeURIComponent(email)}`).then(r => r.json());
  
  userPromise.then(userFromEmail => {
    const courseDataPromises = uniqueCourses.map(course => {
      const courseId = course._id;
      return Promise.all([
        fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/courses/${courseId}/assessments`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/submissions/${courseId}/${encodeURIComponent(userFromEmail.email)}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/course/${courseId}/${encodeURIComponent(userFromEmail.email)}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/courses/${courseId}/resources`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/resources/completions/${userFromEmail._id}`).then(r => r.json()).catch(() => [])
      ]).then(([quizzes, assignments, QuizSubmissions, assignmentSubmissions, resources, resourceCompletions]) => {
        const assignmentsArray = Array.isArray(assignments) ? assignments : Object.values(assignments).flat();

        const quizzesCompleted = quizzes.filter(q => QuizSubmissions.some(s => s.quizId === q._id)).length;
        const assignmentsCompleted = assignmentsArray.filter(a => assignmentSubmissions.some(s => s.assessmentId === a._id)).length;
        const resourcesCompleted = resourceCompletions.filter(c => resources.some(r => r._id === c.resource)).length;

        const totalItems = quizzes.length + assignmentsArray.length + resources.length;
        const completedItems = quizzesCompleted + assignmentsCompleted + resourcesCompleted;
        const progressPercent = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

        // Update card progress
        const card = document.querySelector(`.continue-btn[data-course-key="${course.title || course.courseName}"]`).closest('.course-card');
        const progressFill = card.querySelector(".progress-bar-fill");
        const progressText = card.querySelector(".progress-text");
        const hoursText = card.querySelector(".hours-text");

        progressFill.style.width = progressPercent + "%";
        progressText.textContent = progressPercent + "% Complete";
        hoursText.textContent = Math.floor(progressPercent / 20) + " hrs spent";

        // Update server with progress
        fetch(`${API_BASE_URL}/mycourses/update-progress-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userFromEmail._id, courseId: courseId, progress: progressPercent })
        }).catch(err => console.error("Error updating progress/status:", err));
      });
    });

    Promise.all(courseDataPromises).catch(err => console.error("Error fetching course data:", err));
  }).catch(err => console.error("Failed to fetch user:", err));
}

// Render courses for mobile
function renderMobileCourses(courseList) {
  const mobileContainer = document.getElementById('mobileCourseList');
  if (!mobileContainer) return;
  
  mobileContainer.innerHTML = "";
  
  const uniqueCoursesMap = new Map();
  courseList.forEach(course => {
    const key = course.title || course.courseName;
    if (!uniqueCoursesMap.has(key)) uniqueCoursesMap.set(key, course);
  });
  const uniqueCourses = Array.from(uniqueCoursesMap.values());

  uniqueCourses.forEach(course => {
    const courseKey = course.title || course.courseName;
    
    const courseItem = document.createElement("div");
    courseItem.className = "mobile-course-item";
    courseItem.innerHTML = `
      <div class="mobile-course-header">
        <div class="mobile-course-title">${courseKey}</div>
        <div class="mobile-course-subtitle">${course.description || course.courseDescription || 'No description available'}</div>
      </div>
      <div class="mobile-course-body">
        <div class="mobile-course-meta">
          <span>Course Code: ${course.courseCode || 'N/A'}</span>
          <span>0 hrs spent</span>
        </div>
        <div class="mobile-progress-container">
          <div class="mobile-progress-text">0% Complete</div>
          <div class="mobile-progress-bar">
            <div class="mobile-progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="mobile-course-actions">
          <button class="mobile-btn mobile-btn-primary" data-course-key="${courseKey}">Continue</button>
          <button class="mobile-btn mobile-btn-outline" data-course-id="${course._id}">View Details</button>
        </div>
      </div>
    `;

    mobileContainer.appendChild(courseItem);

    // Add event listeners
    courseItem.querySelector('.mobile-btn-outline').addEventListener('click', e => {
      e.stopPropagation();
      renderCourseDetails(document.getElementById("contentArea"), course);
    });

    courseItem.querySelector('.mobile-btn-primary').addEventListener('click', e => {
      e.stopPropagation();
      goToCourse(courseKey);
    });
  });
}

async function loadTodos() {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email;
  try {
    const res = await fetch(`${API_BASE_URL}/todos/${email}`);
    const todos = await res.json();
    const taskList = document.querySelector('.task-list');
    taskList.innerHTML = '';
    todos.forEach(todo => {
      if (todo.status === 'done') return; // Skip done todos

      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';

      // Format date for display
      const formattedDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';

      taskItem.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" ${todo.status === 'done' ? 'checked' : ''}>
          <span class="task-text">${todo.task}</span>
          <div class="task-meta">
            <span class="task-meta-item"><i class="fas fa-user"></i> ${todo.assignee || ''}</span>
            <span class="task-meta-item"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
            <span class="task-meta-item priority-${todo.priority}">${todo.priority}</span>
            <span class="task-meta-item status-${todo.status}">${todo.status}</span>
            ${todo.course ? `<span class="task-meta-item"><i class="fas fa-book"></i> ${todo.course}</span>` : ''}
          </div>
        </div>
        <button class="delete-task"><i class="fas fa-trash"></i></button>
      `;

      // DELETE functionality
      taskItem.querySelector('.delete-task').addEventListener('click', async () => {
        try {
          await fetch(`${API_BASE_URL}/todos/${todo._id}`, {
            method: 'DELETE'
          });
          taskItem.remove();
        } catch (err) {
          console.error('Failed to delete todo:', err);
        }
      });

      // Checkbox (status) functionality
      const checkbox = taskItem.querySelector('.task-checkbox');
      checkbox.addEventListener('change', async (e) => {
        const newStatus = e.target.checked ? 'done' : 'on-track';
        if (e.target.checked) {
          taskItem.style.opacity = '0.6';
          taskItem.querySelector('.task-text').style.textDecoration = 'line-through';
          const statusBadge = taskItem.querySelector('.status-done, .status-at-risk, .status-on-track');
          if (statusBadge) {
            statusBadge.className = 'task-meta-item status-done';
            statusBadge.textContent = 'done';
          }
        } else {
          taskItem.style.opacity = '1';
          taskItem.querySelector('.task-text').style.textDecoration = 'none';
        }

        // Update status in DB
        try {
          await fetch(`${API_BASE_URL}/todos/${todo._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          // Optionally, remove from UI if marked as done
          if (newStatus === 'done') taskItem.remove();
        } catch (err) {
          console.error('Failed to update todo status:', err);
        }
      });

      taskList.appendChild(taskItem);
    });
  } catch (err) {
    console.error('Failed to load todos:', err);
  }
}

// Load todos for mobile view
async function loadMobileTodos() {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email;
  try {
    const res = await fetch(`${API_BASE_URL}/todos/${email}`);
    const todos = await res.json();
    const mobileTodoList = document.getElementById('mobileTodoList');
    
    if (!mobileTodoList) return;
    
    mobileTodoList.innerHTML = '';
    
    todos.forEach(todo => {
      if (todo.status === 'done') return; // Skip done todos

      const todoItem = document.createElement('div');
      todoItem.className = 'mobile-todo-item';

      const formattedDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';

      todoItem.innerHTML = `
        <input type="checkbox" class="mobile-todo-checkbox" ${todo.status === 'done' ? 'checked' : ''}>
        <div class="mobile-todo-content">
          <div class="mobile-todo-title">${todo.task}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">
            ${todo.assignee || ''} • ${formattedDate} • ${todo.priority} • ${todo.status}
            ${todo.course ? ` • ${todo.course}` : ''}
          </div>
        </div>
      `;

      // Add delete and checkbox functionality (similar to desktop)
      const checkbox = todoItem.querySelector('.mobile-todo-checkbox');
      checkbox.addEventListener('change', async (e) => {
        const newStatus = e.target.checked ? 'done' : 'on-track';
        try {
          await fetch(`${API_BASE_URL}/todos/${todo._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (newStatus === 'done') todoItem.remove();
        } catch (err) {
          console.error('Failed to update todo status:', err);
        }
      });

      mobileTodoList.appendChild(todoItem);
    });
  } catch (err) {
    console.error('Failed to load mobile todos:', err);
  }
}

// Update mobile stats
function updateMobileEnrolledCoursesStat() {
  const mobileStatElement = document.getElementById('mobileCoursesEnrolledStat');
  if (mobileStatElement) {
    mobileStatElement.textContent = enrolledCoursesFromAPI.length;
  }
}

function updateEnrolledCoursesStat() {
  document.getElementById('coursesEnrolledStat').textContent = enrolledCoursesFromAPI.length;
}

function renderEmptyState(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
  }
}