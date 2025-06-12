import { fetchCourses, fetchUserData, fetchMessages, courses, userData, messages } from '../Data/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userId = JSON.parse(localStorage.getItem('user')).name; // Get user ID from localStorage

  await fetchCourses(); // Fetch courses
  await fetchUserData(userId); // Fetch user data
  await fetchMessages(userId); // Fetch messages

  console.log('Courses:', courses);
  console.log('User Data:', userData);
  console.log('Messages:', messages);
});

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

  // Render the content
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Hello ${currentUser.name}!  Set your plan for the day. </h2>
      <p class="text-muted">Track your learning, manage your tasks, and stay up to date.</p>
    </div>
 <br>

      
    <div class="todo-section">
    <div class="todo-header">
      <h3>To-Do</h3>
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
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Life Sciences">Life Sciences</option>
          ${enrolledCourses.map(course => 
            `<option value="${course.title}">${course.title}</option>`
          ).join('')}
        </select>
      </div>
      
      <button class="submit-task-btn">Set</button>
    </div>
    
    <div class="task-list">
      <!-- Tasks will appear here dynamically -->
    </div>
  </div>

   
          ${
            enrolledCourses.length > 0
              ? enrolledCourses
                  .map(
                    course => `
              <div class="card" onclick="goToCourse('${course.title}')">
                <h3>${course.title}</h3>
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${
                    userProgress.courseProgress[course.title] || 0
                  }%"></div>
                </div>
                <div class="info">${
                  userProgress.courseProgress[course.title] || 0
                }% Complete • ${Math.floor(
                  (userProgress.courseProgress[course.title] || 0) / 20
                )} hrs spent</div>
                <a href="#" class="continue-btn" onclick="event.preventDefault(); goToCourse('${course.title}')">Continue</a>
              </div>
            `
                  )
                  .join('')
              : '<p></p>'
          }
        </div>
      </div>
      <div class="enrolled-courses">
        <h2>Enrolled Courses</h2>
        <div class="card-container">
          ${
            enrolledCourses.length > 0
              ? enrolledCourses
                  .map(
                    course => `
              <div class="course-card" onclick="goToCourse('${course.title}')">
                <h5>${course.title}</h5>
                <p>${course.description}</p>
              </div>
            `
                  )
                  .join('')
              : '<p>You haven’t enrolled in any courses yet.</p>'
          }
        </div>
      </div>
      <div class="statistics">
        <h2>Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Courses Enrolled</h4>
            <p>${userProgress.enrolledCourses.length}</p>
          </div>
          <div class="stat-card">
            <h4>Courses Completed</h4>
            <p>${userProgress.completedCourses.length}</p>
          </div>
          <div class="stat-card">
            <h4>Assessments Due</h4>
            <p>${
              enrolledCourses.flatMap(course =>
                course.assessments.filter(a => a.status === 'Upcoming')
              ).length
            }</p>
          </div>
        </div>
      </div>
      <div class="recent-messages">
        <h2>Recent Messages</h2>
        ${
          recentMessages.length > 0
            ? recentMessages
                .map(
                  message => `
            <div class="message-preview">
              <h5>${message.sender}: ${message.subject}</h5>
              <p>${message.content}</p>
              <small>${message.date}</small>
            </div>
          `
                )
                .join('')
            : '<p>No recent messages.</p>'
        }
      </div>
    </div>
  `;
  // Initialize To-Do functionality
  setupTodoFunctionality();
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

  submitBtn.addEventListener('click', () => {
    const taskInput = document.querySelector('.task-input');
    const assignee = document.querySelector('.assignee-select').value;
    const dueDate = document.querySelector('.due-date-input').value;
    const priority = document.querySelector('.priority-select').value;
    const status = document.querySelector('.status-select').value;
    const course = document.querySelector('.course-select').value;

    if (taskInput.value.trim()) {
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
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          taskItem.style.opacity = '0.6';
          taskItem.querySelector('.task-text').style.textDecoration = 'line-through';
          // Auto-set status to Done when checked
          const statusBadge = taskItem.querySelector('.status-done, .status-at-risk, .status-on-track');
          if (statusBadge) {
            statusBadge.className = 'task-meta-item status-done';
            statusBadge.textContent = 'done';
          }
        } else {
          taskItem.style.opacity = '1';
          taskItem.querySelector('.task-text').style.textDecoration = 'none';
        }
      });
    }
  });
}