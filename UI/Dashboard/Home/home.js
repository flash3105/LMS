import { fetchCourses, fetchUserData, fetchMessages, courses, userData, messages } from '../Data/data.js';
document.addEventListener('DOMContentLoaded', async () => {
  const userId = JSON.parse(localStorage.getItem('user')).email; // Get user ID from localStorage

  await fetchCourses(); // Fetch courses
  await fetchUserData(userId); // Fetch user data
  await fetchMessages(userId); // Fetch messages

  console.log('Courses:', courses);
  console.log('User Data:', userData);
  console.log('Messages:', messages);
});

let enrolledCoursesFromAPI = [];

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
        <div id="enrolledCoursesContainer"></div>
      </div>
      <div class="statistics">
        <h2>Statistics</h2>
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
            <p>${
              enrolledCourses.flatMap(course =>
                course.assessments?.filter(a => a.status === 'Upcoming') || []
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

  // Call fetchEnrolledCourses to populate the enrolled courses section
  fetchEnrolledCourses();
  setupTodoFunctionality();

  // Call loadTodos to fetch and display todos from the API
  loadTodos();
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

    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      enrolledCoursesFromAPI = user.enrolledCourses; // <-- store globally
      renderCourses(user.enrolledCourses, "enrolledCoursesContainer");
    } else {
      enrolledCoursesFromAPI = [];
      renderEmptyState("enrolledCoursesContainer", "You have not enrolled in any courses.");
    }

    // After rendering, update the stats
    updateEnrolledCoursesStat();
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    renderEmptyState("enrolledCoursesContainer", "Failed to load enrolled courses.");
  }
}
function renderCourses(courseList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  container.innerHTML = ""; // Clear the container

  // Get user progress from localStorage or userData
  const user = JSON.parse(localStorage.getItem('user')) || {};
  // Use userData if available, fallback to empty object
  const progressData = (userData[user.email] && userData[user.email].courseProgress) || {};

  courseList.forEach(course => {
    // Use course.title or course.courseName as the key
    const courseKey = course.title || course.courseName;
    const progress = progressData[courseKey] || 0;

    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <div class="course-card-content">
        <h5>${courseKey}</h5>
        <p>${course.description || course.courseDescription || ''}</p>
        ${course.authorEmail ? `<p><strong>Author:</strong> ${course.authorEmail}</p>` : ""}
        ${course.courseCode ? `<p><strong>Course Code:</strong> ${course.courseCode}</p>` : ""}
        <div class="progress-bar" style="height: 18px; background: #e9ecef; border-radius: 8px; margin-top: 10px;">
          <div class="progress-bar-fill" style="
            width: ${progress}%;
            background: linear-gradient(90deg, #3182ce 60%, #63b3ed 100%);
            height: 100%;
            border-radius: 8px;
            transition: width 0.5s;
            display: flex;
            align-items: center;
            color: #fff;
            font-weight: bold;
            padding-left: 8px;
            font-size: 13px;
          ">${progress}%</div>
        </div>
      </div>
    `;

    // Add click handler for the card content (to view course details)
    card.querySelector('.course-card-content').addEventListener("click", () => {
      if (typeof renderCourseDetails === "function") {
        renderCourseDetails(document.getElementById("contentArea"), course);
      }
    });

    container.appendChild(card);
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

      // Optionally add event listeners for delete and checkbox
      taskItem.querySelector('.delete-task').addEventListener('click', () => {
        taskItem.remove();
        // Optionally: send DELETE request to API here
      });

      const checkbox = taskItem.querySelector('.task-checkbox');
      checkbox.addEventListener('change', (e) => {
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
        // Optionally: send PATCH/PUT request to API to update status
      });

      taskList.appendChild(taskItem);
    });
  } catch (err) {
    console.error('Failed to load todos:', err);
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



