// Simulated backend using localStorage
let users = JSON.parse(localStorage.getItem("users")) || [
  { email: "student@example.com", password: "pass123", name: "Zinhle Mkhabela", role: "student", bio: "I am a student at NetworkCo.", department: "Developer", startDate: "2024-03-01" }
];
let courses = JSON.parse(localStorage.getItem("courses")) || [
  { id: 1, title: "Intro to HTML & CSS", description: "Basics of web development.", lessons: [{ id: 1, title: "HTML Basics", content: "Learn HTML structure." }, { id: 2, title: "CSS Styling", content: "Style with CSS." }], assessments: [{ id: 1, name: "HTML Quiz", dueDate: "2025-04-25", status: "Upcoming", grade: null }], instructor: "John Doe" },
  { id: 2, title: "JavaScript for Beginners", description: "Learn the fundamentals.", lessons: [{ id: 1, title: "JS Basics", content: "Introduction to JS." }], assessments: [{ id: 1, name: "JS Quiz", dueDate: "2025-04-15", status: "Completed", grade: "85%" }], instructor: "Jane Smith" },
  { id: 3, title: "Git & GitHub", description: "Master version control.", lessons: [], assessments: [], instructor: "Alice W." },
  { id: 4, title: "Bootstrap Framework", description: "Build responsive sites.", lessons: [], assessments: [], instructor: "Bob K." },
  { id: 5, title: "Python Programming", description: "Get started with Python.", lessons: [{ id: 1, title: "Python Basics", content: "Introduction to Python." }], assessments: [{ id: 1, name: "Python Mini Project", dueDate: "2025-04-30", status: "Upcoming", grade: null }], instructor: "John Doe" },
  { id: 6, title: "Intro to Blazor", description: "Learn Microsoft's Blazor.", lessons: [], assessments: [], instructor: "Jane Smith" },
  { id: 7, title: "SQL Basics", description: "Work with databases.", lessons: [], assessments: [], instructor: "Alice W." },
  { id: 8, title: "React.js Fundamentals", description: "Create dynamic UIs.", lessons: [], assessments: [], instructor: "Bob K." },
  { id: 9, title: "Agile Methodologies", description: "Scrum, Kanban & more.", lessons: [], assessments: [], instructor: "John Doe" },
  { id: 10, title: "Node.js Essentials", description: "Back-end with JavaScript.", lessons: [], assessments: [], instructor: "Jane Smith" },
  { id: 11, title: "Web Accessibility", description: "Design for everyone.", lessons: [], assessments: [], instructor: "Alice W." },
  { id: 12, title: "Azure Fundamentals", description: "Upgrade to cloud tech.", lessons: [], assessments: [], instructor: "Bob K." },
  { id: 13, title: "Cybersecurity Basics", description: "Learn online security.", lessons: [], assessments: [], instructor: "Emma R." },
  { id: 14, title: "UI/UX Design", description: "Design user-friendly interfaces.", lessons: [], assessments: [], instructor: "Liam P." },
  { id: 15, title: "Machine Learning Intro", description: "Basics of ML concepts.", lessons: [], assessments: [], instructor: "Sophia T." }
];
let userData = JSON.parse(localStorage.getItem("userData")) || {};
let messages = JSON.parse(localStorage.getItem("messages")) || [
  { id: 1, sender: "HR Department", subject: "Reminder: Complete your onboarding assessment.", content: "Please complete your onboarding assessment by April 20.", date: "2025-04-14" },
  { id: 2, sender: "Mentor - John", subject: "Great job on your GitHub submission!", content: "Your GitHub project looks great! Keep up the good work.", date: "2025-04-09" }
];

// Simulated authenticated user
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || users[0];
let displayedCourses = 9;
let currentTab = "home";
let isCourseDetailsView = false;
let currentCourse = null;

// Initialize the LMS
document.addEventListener("DOMContentLoaded", () => {
  // Ensure user data is initialized
  initializeUserData(currentUser.email);

  // Set user name
  document.getElementById("userName").textContent = currentUser.name;

  // Render initial content
  renderContent("home");

  // Sidebar toggle for mobile
  document.getElementById("toggleSidebar").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
  });

  // Sidebar navigation
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const tab = link.id.replace("Link", "");
      currentTab = tab;
      isCourseDetailsView = false;
      if (tab === "signOut") {
        signOut();
      } else {
        renderContent(tab);
      }
    });
  });

  // Search input listener
  document.getElementById("searchInput").addEventListener("keyup", searchGlobal);
});

// Initialize user data
function initializeUserData(email) {
  if (!userData[email]) {
    userData[email] = {
      enrolledCourses: ["Intro to HTML & CSS", "Python Programming"],
      courseProgress: { "Intro to HTML & CSS": 60, "Python Programming": 30 },
      completedLessons: { "Intro to HTML & CSS": [1], "Python Programming": [] },
      completedCourses: [
        { title: "Data Cleaning Basics", date: "2025-04-05", score: "85%", timeSpent: "4h 10m" },
        { title: "SQL Fundamentals", date: "2025-03-28", score: "90%", timeSpent: "3h 45m" }
      ]
    };
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

// Render content based on the active tab
function renderContent(tab) {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = "";

  switch (tab) {
    case "home":
      renderHomeTab(contentArea);
      break;
    case "profile":
      renderProfileTab(contentArea);
      break;
    case "learning":
      renderLearningTab(contentArea);
      break;
    case "assessments":
      renderAssessmentsTab(contentArea);
      break;
    case "calendar":
      renderCalendarTab(contentArea);
      break;
    case "messages":
      renderMessagesTab(contentArea);
      break;
    case "assist":
      renderAssistTab(contentArea);
      break;
  }
}

// Home Tab (Enhanced Dashboard)
function renderHomeTab(contentArea) {
  const userProgress = userData[currentUser.email];
  const enrolledCourses = courses.filter(course => userProgress.enrolledCourses.includes(course.title));
  const recentMessages = messages.slice(0, 2); // Show only the latest 2 messages

  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Welcome to your LMS Dashboard, ${currentUser.name}! 👋</h2>
      <p class="text-muted">Track your learning, manage your tasks, and stay up to date.</p>
    </div>
    <div class="home-section">
      <div class="ongoing-courses">
        <h2>Ongoing Courses</h2>
        <div class="grid">
          ${enrolledCourses.length > 0 ? enrolledCourses.map(course => `
            <div class="card" onclick="goToCourse('${course.title}')">
              <h3>${course.title}</h3>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${userProgress.courseProgress[course.title] || 0}%"></div>
              </div>
              <div class="info">${userProgress.courseProgress[course.title] || 0}% Complete • ${Math.floor((userProgress.courseProgress[course.title] || 0) / 20)} hrs spent</div>
              <a href="#" class="continue-btn" onclick="event.preventDefault(); goToCourse('${course.title}')">Continue</a>
            </div>
          `).join('') : '<p>No ongoing courses. Enroll in a course to get started!</p>'}
        </div>
      </div>
      <div class="enrolled-courses">
        <h2>Enrolled Courses</h2>
        <div class="card-container">
          ${enrolledCourses.length > 0 ? enrolledCourses.map(course => `
            <div class="course-card" onclick="goToCourse('${course.title}')">
              <h5>${course.title}</h5>
              <p>${course.description}</p>
            </div>
          `).join('') : '<p>You haven’t enrolled in any courses yet.</p>'}
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
            <p>${enrolledCourses.flatMap(course => course.assessments.filter(a => a.status === "Upcoming")).length}</p>
          </div>
        </div>
      </div>
      <div class="recent-messages">
        <h2>Recent Messages</h2>
        ${recentMessages.length > 0 ? recentMessages.map(message => `
          <div class="message-preview">
            <h5>${message.sender}: ${message.subject}</h5>
            <p>${message.content}</p>
            <small>${message.date}</small>
          </div>
        `).join('') : '<p>No recent messages.</p>'}
      </div>
    </div>
  `;
}

// Profile Tab
function renderProfileTab(contentArea) {
  const userProgress = userData[currentUser.email];
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">My Profile</h2>
      <p class="text-muted">Manage your account and track your progress.</p>
    </div>
    <div class="profile-section">
      <h3>Account Details</h3>
      <p><strong>Name:</strong> ${currentUser.name}</p>
      <p><strong>Email:</strong> ${currentUser.email}</p>
      <p><strong>Department:</strong> ${currentUser.department}</p>
      <p><strong>Internship Start Date:</strong> ${currentUser.startDate}</p>
      <p><strong>Role:</strong> ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
      <p><strong>Bio:</strong> ${currentUser.bio}</p>
      <h3>Learning Stats</h3>
      <p><strong>Courses Enrolled:</strong> ${userProgress.enrolledCourses.length}</p>
      <p><strong>Courses Completed:</strong> ${userProgress.completedCourses.length}</p>
      <h3>Settings</h3>
      <div class="settings-item" onclick="editProfile()">
        <p>Edit Profile</p>
      </div>
      <div class="settings-item" onclick="changePassword()">
        <p>Change Password</p>
      </div>
    </div>
  `;
}

// Learning Tab
function renderLearningTab(contentArea) {
  if (isCourseDetailsView) {
    renderCourseDetails(contentArea, currentCourse);
  } else {
    contentArea.innerHTML = `
      <div class="welcome">
        <h2 class="fw-bold">Learning Dashboard</h2>
        <p class="text-muted">Explore your courses and track your learning journey below.</p>
      </div>
      <div class="section-title">Available Courses</div>
      <div class="card-container" id="courseContainer"></div>
      <div class="view-more">
        <button id="viewMoreBtn" onclick="viewMoreCourses()">View More</button>
      </div>
    `;
    renderCourses(courses.slice(0, displayedCourses));
  }
}

// Render course details
function renderCourseDetails(contentArea, course) {
  const userProgress = userData[currentUser.email];
  const isEnrolled = userProgress.enrolledCourses.includes(course.title);
  const completedLessons = userProgress.completedLessons ? userProgress.completedLessons[course.title] || [] : [];
  const progress = userProgress.courseProgress ? userProgress.courseProgress[course.title] || 0 : 0;

  contentArea.innerHTML = `
    <button class="back-button" onclick="goBackToCourses()">Back to Courses</button>
    <div class="course-details">
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <p><strong>Instructor:</strong> ${course.instructor}</p>
      ${currentUser.role === "student" ? `
        <button class="enrol-button ${isEnrolled ? 'enrolled' : ''}" onclick="enrolInCourse('${course.title}')">
          ${isEnrolled ? 'Enrolled' : 'Enrol'}
        </button>
      ` : ''}
      ${isEnrolled ? `
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <h4>Lessons</h4>
        ${course.lessons.length > 0 ? course.lessons.map(lesson => `
          <div class="lesson-item ${completedLessons.includes(lesson.id) ? 'completed' : ''}">
            <div>
              <h5>${lesson.title}</h5>
              <p>${lesson.content}</p>
            </div>
            ${!completedLessons.includes(lesson.id) ? `
              <button onclick="completeLesson('${course.title}', ${lesson.id})">Complete</button>
            ` : '<span>Completed</span>'}
          </div>
        `).join('') : '<p>No lessons available.</p>'}
        <h4>Assessments</h4>
        <table class="assessments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${course.assessments.length > 0 ? course.assessments.map(assessment => `
              <tr>
                <td>${assessment.name}</td>
                <td>${assessment.dueDate}</td>
                <td>${assessment.status}</td>
                <td>${assessment.grade || 'N/A'}</td>
              </tr>
            `).join('') : '<tr><td colspan="4">No assessments available.</td></tr>'}
          </tbody>
        </table>
      ` : ''}
    </div>
  `;
}

// Enrol in a course
function enrolInCourse(courseTitle) {
  const userProgress = userData[currentUser.email];
  if (!userProgress.enrolledCourses.includes(courseTitle)) {
    userProgress.enrolledCourses.push(courseTitle);
    userProgress.courseProgress = userProgress.courseProgress || {};
    userProgress.courseProgress[courseTitle] = 0;
    userProgress.completedLessons = userProgress.completedLessons || {};
    userProgress.completedLessons[courseTitle] = [];
    localStorage.setItem("userData", JSON.stringify(userData));
    renderCourseDetails(document.getElementById("contentArea"), courses.find(course => course.title === courseTitle));
  }
}

// Complete a lesson
function completeLesson(courseTitle, lessonId) {
  const userProgress = userData[currentUser.email];
  if (!userProgress.completedLessons[courseTitle]) {
    userProgress.completedLessons[courseTitle] = [];
  }
  userProgress.completedLessons[courseTitle].push(lessonId);

  // Calculate progress
  const course = courses.find(c => c.title === courseTitle);
  const totalLessons = course.lessons.length;
  const completedLessons = userProgress.completedLessons[courseTitle].length;
  userProgress.courseProgress[courseTitle] = (completedLessons / totalLessons) * 100;

  // Check if course is completed
  if (completedLessons === totalLessons) {
    userProgress.completedCourses.push({
      title: courseTitle,
      date: new Date().toISOString().split("T")[0],
      score: "90%", // Simulated score
      timeSpent: `${Math.floor(completedLessons / 2)}h ${completedLessons * 10}m`
    });
  }

  localStorage.setItem("userData", JSON.stringify(userData));
  renderCourseDetails(document.getElementById("contentArea"), course);
}

// Go back to the main courses list
function goBackToCourses() {
  isCourseDetailsView = false;
  renderLearningTab(document.getElementById("contentArea"));
}

// Render courses (used in Learning tab)
function renderCourses(courseList) {
  const container = document.getElementById("courseContainer");
  if (!container) return;
  container.innerHTML = "";
  courseList.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <h5>${course.title}</h5>
      <p>${course.description}</p>
      <button class="btn btn-success btn-sm enrol-button" onclick="event.stopPropagation(); enrolInCourse('${course.title}')">
        ${userData[currentUser.email].enrolledCourses.includes(course.title) ? 'Enrolled' : 'Enrol'}
      </button>
    `;
    card.addEventListener("click", () => {
      isCourseDetailsView = true;
      currentCourse = course;
      renderCourseDetails(document.getElementById("contentArea"), course);
    });
    container.appendChild(card);
  });
}

// View more courses (used in Learning tab)
function viewMoreCourses() {
  if (currentTab !== "learning" || isCourseDetailsView) return;
  displayedCourses += 6;
  const query = document.getElementById("searchInput").value.toLowerCase();
  let courseList = courses;
  if (query) {
    courseList = courses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    );
  }
  renderCourses(courseList.slice(0, displayedCourses));
  if (displayedCourses >= courseList.length) {
    document.getElementById("viewMoreBtn").style.display = "none";
  }
}

// Assessments Tab
function renderAssessmentsTab(contentArea) {
  const userProgress = userData[currentUser.email];
  const enrolledCourses = courses.filter(course => userProgress.enrolledCourses.includes(course.title));
  const allAssessments = enrolledCourses.flatMap(course =>
    course.assessments.map(assessment => ({
      ...assessment,
      course: course.title
    }))
  );

  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Assessments</h2>
      <p class="text-muted">Track your upcoming and completed assessments.</p>
    </div>
    <div class="assessments-section">
      <h3>Assignments & Quizzes</h3>
      <table class="assessments-table">
        <thead>
          <tr>
            <th>Assessment</th>
            <th>Course</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Grade</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${allAssessments.length > 0 ? allAssessments.map(assessment => `
            <tr>
              <td>${assessment.name}</td>
              <td>${assessment.course}</td>
              <td>${assessment.dueDate}</td>
              <td>${assessment.status}</td>
              <td>${assessment.grade || 'N/A'}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" onclick="alert('Simulated action: ${assessment.status === 'Upcoming' ? 'Attempt' : 'View'} assessment')">
                  ${assessment.status === 'Upcoming' ? 'Attempt' : 'View'}
                </button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="6">No assessments available.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// Calendar Tab
function renderCalendarTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Calendar</h2>
      <p class="text-muted">Stay on top of your schedule.</p>
    </div>
    <div class="calendar-section">
      <h3>April 2025</h3>
      <iframe src="https://calendar.google.com/calendar/embed?src=en.za%23holiday%40group.v.calendar.google.com&ctz=Africa%2FJohannesburg" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>
    </div>
  `;
}

// Messages Tab
function renderMessagesTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Messages</h2>
      <p class="text-muted">Stay connected with instructors.</p>
    </div>
    <div class="messages-section">
      <h3>Inbox</h3>
      ${messages.map(message => `
        <div class="message-item">
          <h5>${message.sender}: ${message.subject}</h5>
          <p>${message.content}</p>
          <small>${message.date}</small>
        </div>
      `).join('')}
      <h3>Send a Message</h3>
      <form class="message-form" onsubmit="sendMessage(event)">
        <textarea placeholder="Write your message here..." required></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
}

// Send a message
function sendMessage(event) {
  event.preventDefault();
  const content = event.target.querySelector("textarea").value;
  messages.push({
    id: messages.length + 1,
    sender: currentUser.name,
    subject: content.substring(0, 20) + "...",
    content,
    date: new Date().toISOString().split("T")[0]
  });
  localStorage.setItem("messages", JSON.stringify(messages));
  renderMessagesTab(document.getElementById("contentArea"));
}

// Assist Tab
function renderAssistTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Need Help?</h2>
      <p class="text-muted">Submit a support request.</p>
    </div>
    <div class="assist-section">
      <form onsubmit="submitAssistRequest(event)">
        <div class="mb-3">
          <label for="assistSubject" class="form-label">Subject</label>
          <input type="text" class="form-control" id="assistSubject" placeholder="Enter subject" required>
        </div>
        <div class="mb-3">
          <label for="assistMessage" class="form-label">Message</label>
          <textarea class="form-control" id="assistMessage" rows="4" placeholder="Describe your issue..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Request</button>
      </form>
    </div>
  `;
}

// Submit assist request
function submitAssistRequest(event) {
  event.preventDefault();
  alert("Support request submitted! (Simulated)");
}

// Navigation Functions
function goToCourse(courseTitle) {
  currentTab = "learning";
  isCourseDetailsView = true;
  currentCourse = courses.find(course => course.title === courseTitle);
  document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
  document.getElementById("learningLink").classList.add("active");
  renderLearningTab(document.getElementById("contentArea"));
}

// Profile Tab Functions
function editProfile() {
  const newName = prompt("Enter your new name:", currentUser.name);
  const newBio = prompt("Enter your new bio:", currentUser.bio);
  if (newName && newBio) {
    currentUser.name = newName;
    currentUser.bio = newBio;
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    users[userIndex] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    document.getElementById("userName").textContent = currentUser.name;
    renderProfileTab(document.getElementById("contentArea"));
  }
}

function changePassword() {
  const newPassword = prompt("Enter your new password:");
  if (newPassword) {
    currentUser.password = newPassword;
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    users[userIndex] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    alert("Password updated successfully.");
  }
}

function signOut() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  window.location.href = "login.html"; // Adjust to your login page
}

// Global Search
function searchGlobal() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (currentTab === "learning" && !isCourseDetailsView) {
    const filteredCourses = courses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    );
    renderCourses(filteredCourses.slice(0, displayedCourses));
    document.getElementById("viewMoreBtn").style.display = filteredCourses.length > displayedCourses ? "block" : "none";
  } else {
    alert(`Searching for: ${query}\nThis would search across all content in a real implementation.`);
  }
}