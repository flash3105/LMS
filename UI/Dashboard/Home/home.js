import { renderCourseDetails } from '../Courses/Courses.js';
import { fetchCourses, fetchUserData, fetchMessages, courses, userData, messages } from '../Data/data.js';
document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.email;

  await fetchCourses(); // Wait for courses to load
  await fetchUserData(userId); // Wait for user data to load
  await fetchMessages(userId);

  // Now render, when data is ready
  renderHomeTab(document.getElementById('contentArea'), user);
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
    <style>
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
      z
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
        align-items: stretch; /* Ensure buttons stretch to same height */
      }
      
      .continue-btn, .view-btn {
        flex: 1;
        padding: 0.75rem 0.5rem; /* Increased vertical padding */
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 42px; /* Set a minimum height */
        box-sizing: border-box; /* Include padding in height calculation */
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
        <h2 class="section-title" style= "color:white">Statistics</h2>
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
        <h2 class="section-title">Recent Messages</h2>
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
  console.log("User data email: ", userData[user.email]);
  console.log("progress data: ", progressData);
  courseList.forEach(course => {
    // Use course.title or course.courseName as the key
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
        
        <div> <!--this had the progress-container class -->
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

   // Append card immediately
  container.appendChild(card);

  // Fetch quizzes, assignments, resources and resource completions asynchronously
  Promise.all([
    fetch(`${API_BASE_URL}/courses/${course._id}/quizzes`).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE_URL}/courses/${course._id}/assessments`).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE_URL}/submissions/${course._id}/${encodeURIComponent(user.email)}`).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE_URL}/course/${course._id}/${encodeURIComponent(user.email)}`).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE_URL}/courses/${course._id}/resources`).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE_URL}/resources/completions/${user._id}`).then(res => res.json()).catch(() => [])
  ]).then(([quizzes, assignments, QuizSubmissions, assignmentSubmissions, resources, resourceCompletions]) => {
    const quizzesCompleted = quizzes.filter(q =>
      QuizSubmissions.some(s => s.quizId === q._id)
    ).length || 0;
    
    const assignmentsCompleted =  assignments.filter(a =>
      assignmentSubmissions.some(s => s.assessmentId === a._id)
    ).length || 0;
    
    //const resourcesCompleted = resourceCompletions.length;
    const resourcesCompleted = resourceCompletions.filter(c =>
      resources.some(r => r._id === c.resource)
    ).length || 0;


    //Calculating values to use for the progress bar
    const totalItems = quizzes.length + assignments.length + resources.length;
    const completedItems = quizzesCompleted + assignmentsCompleted + resourcesCompleted;
    const progressPercent = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

    // Update progress bar dynamically
    const progressFill = card.querySelector(".progress-bar-fill");
    const progressText = card.querySelector(".progress-text");
    const hoursText = card.querySelector(".hours-text");

    progressFill.style.width = progressPercent + "%";
    progressText.textContent = progressPercent + "% Complete";
    hoursText.textContent = Math.floor(progressPercent / 20) + " hrs spent"; // test ecample for calculating hours spent on a course

    // Update quizzes info
    //const quizzesInfo = card.querySelector(".quizzes-info");
    //quizzesInfo.textContent = `Quizzes: ${quizzesCompleted}/${quizzes.length}, Assignments: ${assignmentsCompleted}/${assignments.length}`;
  });


    // Add click handler for the view details button
    card.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof renderCourseDetails === "function") {
        renderCourseDetails(document.getElementById("contentArea"), course);
      }
    });

    // Add click handler for the continue button
    card.querySelector('.continue-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const courseKey = e.target.getAttribute('data-course-key');
      goToCourse(courseKey);
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

function updateEnrolledCoursesStat() {
  document.getElementById('coursesEnrolledStat').textContent = enrolledCoursesFromAPI.length;
}

function renderEmptyState(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
  }
}