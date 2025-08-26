
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Render Quick Links based on user role
function renderQuickLinks(currentUser) {
  const links = [
    { id: 'viewReportsLink', text: 'View Reports', icon: 'chart-bar', role: 'user' }
  ];

  return `
    <div class="quick-links card">
      <h2 class="card-header"><i class="fas fa-link"></i> Quick Links</h2>
      <div class="card-body">
        <ul class="link-list">
          ${links
            .filter(link => link.role === 'all' || (currentUser.role === 'admin' && link.role === 'admin') || (currentUser.role !== 'admin' && link.role === 'user'))
            .map(link => `
              <li>
                <a href="#" id="${link.id}" class="link-item">
                  <i class="fas fa-${link.icon}"></i> ${link.text}
                </a>
              </li>
            `).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Render system statistics card
async function renderStatistics() {
  try {
    const [assessmentsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/assessments/count`),
      fetch(`${API_BASE_URL}/auth/registered-users`)
    ]);

    if (!assessmentsRes.ok || !usersRes.ok) throw new Error('Failed to fetch data');

    const assessments = await assessmentsRes.json();
    const users = await usersRes.json();

    return `
      <div class="statistics card">
        <h2 class="card-header"><i class="fas fa-chart-pie"></i> System Statistics</h2>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-card bg-warning">
              <i class="fas fa-tasks"></i>
              <div>
                <h3>Total Assessments</h3>
                <p>${assessments.totalAssessments || 0}</p>
              </div>
            </div>
            <div class="stat-card bg-primary">
              <i class="fas fa-users"></i>
              <div>
                <h3>Total Registered Users</h3>
                <p>${users.totalUsers || 0}</p>
                <button class="btn btn-sm btn-outline-secondary view-users-btn">
                  <i class="fas fa-eye"></i> View Users
                </button>
              </div>
            </div>
          </div>
          <div class="users-section" style="display: none;">
            <h3>Registered Users</h3>
            <table class="table table-striped">
              <thead><tr><th>#</th><th>Email</th><th>Name</th><th>Role</th></tr></thead>
              <tbody>
                ${users.users.map((u, i) => `
                  <tr><td>${i + 1}</td><td>${u.email}</td><td>${u.name}</td><td>${u.role}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <p class="text-muted update-time">
            Last updated: ${new Date().toLocaleTimeString()}
            <button class="btn btn-sm btn-outline-secondary refresh-stats">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Statistics load error:', err);
    return `<div class="statistics card"><div class="alert alert-danger">Failed to load statistics: ${err.message}</div></div>`;
  }
}

// Render Home Tab
export async function renderHomeTab(container, currentUser) {
  container.innerHTML = `
    <div id="homeContent" class="dashboard-loading">
      <h1>Loading Dashboard...</h1>
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;

  try {
    const [quickLinks, statistics] = await Promise.all([
      renderQuickLinks(currentUser),
      renderStatistics()
    ]);

    container.innerHTML = `
      <div id="homeContent" class="dashboard-home">
        <div class="dashboard-header">
          <h1>Welcome, ${currentUser.name}!</h1>
          <p class="text-muted">${new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}</p>
        </div>
        <div class="dashboard-grid">
          <div class="grid-col-1">${quickLinks}${statistics}</div>
          <div class="grid-col-2"><!-- Announcements and Activity can be added here --></div>
        </div>
      </div>
    `;

    setupDashboardInteractions(currentUser);
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <h2>Dashboard Error</h2><p>${err.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
}

// Handle interactions on the dashboard
function setupDashboardInteractions(currentUser) {
  document.querySelectorAll('.link-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switch (link.id) {
        case 'viewReportsLink':
          renderReportsPage(document.getElementById('contentArea'));
          break;
      }
    });
  });

  const viewUsersBtn = document.querySelector('.view-users-btn');
  if (viewUsersBtn) {
    viewUsersBtn.addEventListener('click', () => {
      const section = document.querySelector('.users-section');
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  }

  const refreshBtn = document.querySelector('.refresh-stats');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      const statsContainer = document.querySelector('.statistics .card-body');

      try {
        const res = await fetch(`${API_BASE_URL}/Statistics`);
        if (!res.ok) throw new Error('Failed to refresh stats');
        const stats = await res.json();

        statsContainer.querySelector('.stat-card:nth-child(1) p').textContent = stats.totalAssessments || 0;
        statsContainer.querySelector('.stat-card:nth-child(2) p').textContent = stats.totalUsers || 0;

        document.querySelector('.update-time').innerHTML = `
          Last updated: ${new Date().toLocaleTimeString()}
          <button class="btn btn-sm btn-outline-secondary refresh-stats">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        `;

        setupDashboardInteractions(currentUser); // Rebind buttons
      } catch (err) {
        alert(`Refresh failed: ${err.message}`);
      }
    });
  }
}

function renderAnalyticsLayout(container, activeTab, bodyContent = "") {
  container.innerHTML = `
    <div class="reports-page card">
      <h2 class="card-header"><i class="fas fa-chart-line"></i> LMS Reports & Analytics</h2>
      <div class="card-body">
        <button id="backButton" class="btn btn-secondary mb-3">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div class="mb-3">
          <button id="showUserProgressAnalytics" class="btn ${activeTab === "user" ? "btn-primary" : "btn-outline-primary"}">User progress</button>
          <button id="showCourseAnalytics" class="btn ${activeTab === "courses" ? "btn-primary" : "btn-outline-primary"}">Courses</button>
          <button id="showAssessmentAnalytics" class="btn ${activeTab === "assessments" ? "btn-primary" : "btn-outline-primary"}">Assessments</button>
          <button id="showActivityAnalytics" class="btn ${activeTab === "activity" ? "btn-primary" : "btn-outline-primary"}">Activity</button>
        </div>
        <div id="analyticsContent">
          ${bodyContent}
        </div>
      </div>
    </div>
  `;

  // Back button
  document.getElementById("backButton").addEventListener("click", () => {
    renderHomeTab(container, { name: "User", role: "user" }); // adjust to real currentUser
  });

  // Tab buttons
  document.getElementById("showUserProgressAnalytics").addEventListener("click", () => renderReportsPage(container));
  document.getElementById("showCourseAnalytics").addEventListener("click", () => renderCoursesAnalytics(container));
  document.getElementById("showAssessmentAnalytics").addEventListener("click", () => renderAssessmentsAnalytics(container));
  document.getElementById("showActivityAnalytics").addEventListener("click", () => renderActivityAnalytics(container));
}


// Reports Page
async function renderReportsPage(container) {
  try {
    const [assessmentsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/assessments/count`),
      fetch(`${API_BASE_URL}/auth/registered-users`),
    ]);

    if (!assessmentsRes.ok || !usersRes.ok) throw new Error('Failed to fetch data');

    const assessments = await assessmentsRes.json();
    const users = await usersRes.json();

    // Fetch courses per user
    const usersWithCourses = await Promise.all(
      users.users.map(async (u) => {
        if (u.role === 'Student' || u.role === 'Intern') {
          const res = await fetch(`${API_BASE_URL}/mycourses/${encodeURIComponent(u.email)}`);
          const courses = res.ok ? await res.json() : { enrolledCourses: [] };
          console.log("Course count: ", courses.enrolledCourses.length);
          return { ...u, courseCount: courses.enrolledCourses.length };
        }
        return { ...u, courseCount: 0 };
      })
    );

    // Prepare the table HTML
    const tableHTML = `
      <ul>
        <li>User progress over time</li>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${usersWithCourses
              .filter(u => u.role === 'Student' || u.role === 'Intern')
              .map((u, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${u.email}</td>
                  <td>${u.name}</td>
                  <td>${u.role}</td>
                  <td>${u.courseCount}</td>
                  <td>
                    <button class="btn btn-primary btn-sm details-btn" data-email="${u.email}">
                      Details
                    </button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </ul>
      <div class="text-muted mt-3">
        <i class="fas fa-spinner fa-spin"></i> More analytics coming soon...
      </div>
    `;

    // Render the layout once
    renderAnalyticsLayout(container, "user", tableHTML);

    // Add per-user details buttons
    document.querySelectorAll(".details-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const email = e.currentTarget.dataset.email;
        await renderUserAnalytics(container, email);
      });
    });

  } catch (err) {
    console.error('Statistics load error:', err);
    container.innerHTML = `
      <div class="statistics card">
        <div class="alert alert-danger">Failed to load statistics: ${err.message}</div>
      </div>`;
  }

  document.getElementById('backButton').addEventListener('click', () => {
    renderHomeTab(container, { name: 'User', role: 'user' }); // Replace with actual currentUser
  });
}



async function renderUserAnalytics(container, email) {
  let userData;

  // Fallback if user courses fetch fails
  try {
    const res = await fetch(`${API_BASE_URL}/mycourses/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to fetch user courses');
    userData = await res.json();
  } catch (err) {
    console.warn('Failed to fetch user courses, using empty fallback:', err);
    userData = {
      name: 'Unknown User',
      enrolledCourses: []
    };
  }

  let allQuizzesTaken = [];

  try {
    // Fetch quizzes + submissions for each course
    const coursesWithQuizzes = await Promise.all(
      userData.enrolledCourses.map(async (course) => {
        try {
          //Fetches quizzes for thic course and user
          const quizzesRes = await fetch(`${API_BASE_URL}/courses/${course._id}/quizzes`);
          const quizzes = quizzesRes.ok ? await quizzesRes.json() : [];

          console.log("Quizzes: ", quizzes);

          //Fetches assignments for this course and user
          const assRes = await fetch(`${API_BASE_URL}/courses/${course._id}/assessments`);
          const assessments = assRes.ok ? await assRes.json() : [];

          // Fetches quiz submissions for this course and user
          const quizSubsRes = await fetch(`http://localhost:5000/api/submissions/${course._id}/${encodeURIComponent(email)}`);
          const QuizSubmissions = quizSubsRes.ok ? await quizSubsRes.json() : [];

          //Fetches assignments submissions for this course and user
          const assSubsRes = await fetch(`${API_BASE_URL}/course/${course._id}/${encodeURIComponent(email)}`);
          const assignmentSubmissions = assSubsRes.ok ? await assSubsRes.json() : [];

          console.log("Quiz Submissions: ", QuizSubmissions);
          console.log("Assignment submissions: ", assignmentSubmissions);

          
          const resourceRes = await fetch(`${API_BASE_URL}/courses/${course._id}/resources`);
          const resources = await resourceRes.json();

          const res = await fetch(`http://localhost:5000/api/email/${encodeURIComponent(email)}`);
          if (!res.ok) throw new Error('User not found');
          const user = await res.json();
          console.log('Fetched user:', user);

          const compRes = await fetch(`http://localhost:5000/api/resources/completions/${user._id}`);
          const completions = (await compRes.json()).filter(c =>
            resources.some(r => r._id === c.resource)
          );

          console.log("Completions: ", completions);

          // Count quizzes that have submissions
          const quizzesTaken = quizzes.filter(q =>
            QuizSubmissions.some(s => s.quizId === q._id)
          );

          allQuizzesTaken.push(...quizzesTaken);


          console.log("Quizzes taken: ", quizzesTaken)

          const assignemntsSubmitted = assessments.filter(a =>
            assignmentSubmissions.some(s => s.assessmentId === a._id)
          ).length;

          const totalQuizzes = quizzes.length;
          const totalAssessments = assessments.length;

          const completedResources = completions.length
          const allResources = resources.length;

          const completedItems = quizzesTaken.length + assignemntsSubmitted + completedResources;
          const totalItems = totalQuizzes + totalAssessments + allResources;

          const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

          return {
            ...course,
            quizzesTaken: quizzesTaken.length || 0,
            totalQuizzes,
            assignemntsSubmitted,
            totalAssessments,
            completedResources,
            allResources,
            progress,
            assessments
          };
        } catch (err) {
          console.error('Failed fetching for', course.courseName, err);
          return { ...course, quizzesTaken: 0, totalQuizzes: 0, assignemntsSubmitted: 0, totalAssessments: 0, progress: 0, assessments: [] };
        }
      })
    );

    const totalCourses = userData.enrolledCourses.length;
    const totalQuizzes = coursesWithQuizzes.reduce((sum, c) => sum + (c.quizzesTaken || 0), 0);
    const totalAssignments = coursesWithQuizzes.reduce((sum, c) => sum + (c.assignemntsSubmitted || 0), 0);
    const completedCourses = 0;
    const completedResources = coursesWithQuizzes.reduce((sum, c) => sum + (c.completedResources || 0), 0);

    // Base UI with buttons
    container.innerHTML = `
      <div class="user-analytics card">
        <div class="mb-3 d-flex gap-2">
          <button id="backToReports" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <h2 class="card-header">Analytics for ${userData.name}</h2>
        <div class="card-body">
          <!-- KPI Cards -->
          <div class="kpi-cards d-flex gap-3 mb-4">
            <div class="card p-2 text-center">Enrolled Courses: ${totalCourses}</div>
            <div class="card p-2 text-center">Completed Courses: ${completedCourses} </div>
            <div class="card p-2 text-center">Quizzes Taken: ${totalQuizzes}</div>
            <div class="card p-2 text-center">Assignments Submitted: ${totalAssignments}</div>
            <div class="card p-2 text center">Resources completed: ${completedResources}</div>
          </div>
          <div>
            <button id="showCourses" class="btn btn-primary">Courses</button>
            <button id="showQuizzes" class="btn btn-outline-primary">Quizzes</button>
          </div>
          <div id="tableContainer"></div>
        </div>
      </div>
    `;

    const tableContainer = document.getElementById("tableContainer");

    // Courses Table
    function renderCoursesTable() {
      tableContainer.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Course</th>
              <th>Quizzes Taken</th>
              <th>Assignments Done</th>
              <th>Resources completed</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            ${coursesWithQuizzes.map(c => `
              <tr>
                <td>${c.courseName}</td>
                <td>${c.quizzesTaken} / ${c.totalQuizzes}</td>
                <td>${c.assignemntsSubmitted} / ${c.totalAssessments}</td>
                <td>${c.completedResources} / ${c.allResources} </td>
                <td>
                  <div class="progress" style="width:100%; background:#eee; border:1px solid #ccc; border-radius:5px; height:12px; position:relative; overflow:hidden;">
                    <div class="progress-bar" role="progressbar" style="width: ${c.progress || 0}%; background:#2196f3; height:100%;">
                  </div>
                    <span style="position:absolute; top:0; left:50%; transform:translateX(-50%); font-size:10px; line-height:12px; font-weight:bold; color:#000;">
                      ${c.progress || 0}%
                    </span>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    function renderQuizzesTable() {
      // Clear the container first
      tableContainer.innerHTML = "<p>Loading quizzes...</p>";

      

      // Fetch additional info for all quizzes asynchronously
      Promise.all(
        allQuizzesTaken.map(async (q) => {
          const courseRes = await fetch(`${API_BASE_URL}/mycourses/retrieve/${q.courseId}`);
          const courses = courseRes.ok ? await courseRes.json() : {};
          const gradeRes = await fetch(`${API_BASE_URL}/grades/course/${q.courseId}`);
          const grades = gradeRes.ok ? await gradeRes.json() : {};
          
          const quizGrade = grades.find(g => g.refId === q._id);
          console.log("Courses: ", courses);
          console.log("Grades: ", grades);
          console.log("Quiz grade: ", quizGrade);
          return {
            ...q,
            dueDate: courses.dueDate || q.dueDate,
            courseName: courses.courseName,
            grade: quizGrade ? quizGrade.grade : "-",
            feedback: quizGrade ? quizGrade.feedback : ""
          };
        })
      )
      .then(quizzesWithExtra => {
        const rows = quizzesWithExtra.map(q => `
          <tr>
            <td>${q.title || "-"}</td>
            <td>${q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "-"}</td>
            <td>${q.courseName || "-"}</td>
            <td>${q.grade}</td>
            <td>${q.feedback}</td>
          </tr>
        `);

        tableContainer.innerHTML = `
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Due Date</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.join('') : "<tr><td colspan='3'>No quizzes found</td></tr>"}
            </tbody>
          </table>
        `;
      })
      .catch(err => {
        console.error("Failed fetching extra quiz data:", err);
        tableContainer.innerHTML = "<p>Failed to load quizzes.</p>";
      });
    }

    // Assessments Table
    function renderAssessmentsTable() {
      assessments.map(a => `
        <tr>
          <td>${a.name || "-"}</td>
          <td>${a.type || "Unknown"}</td>
          <td>${a.highestGrade ?? "-"}</td>
          <td>${a.attempts ?? 0}</td>
          <td>${a.timeTaken ?? "-"}</td>
          <td>${a.dateSubmitted ? new Date(a.dateSubmitted).toLocaleString() : "-"}</td>
        </tr>
      `);
      tableContainer.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Assessment</th>z
              <th>Type</th>
              <th>Highest Grade</th>
              <th>Attempts</th>
              <th>Time Taken</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.join('') : "<tr><td colspan='5'>No assessments found</td></tr>"}
          </tbody>
        </table>
      `;
    }

    // Default to courses
    renderCoursesTable();

    // Event listeners
    document.getElementById("backToReports").addEventListener("click", () => {
      renderReportsPage(container);
    });

    document.getElementById("showCourses").addEventListener("click", () => {
      renderCoursesTable();
      document.getElementById("showCourses").classList.add("btn-primary");
      document.getElementById("showCourses").classList.remove("btn-outline-primary");
      document.getElementById("showQuizzes").classList.add("btn-outline-primary");
      document.getElementById("showQuizzes").classList.remove("btn-primary");
    });

    document.getElementById("showQuizzes").addEventListener("click", () => {
      renderQuizzesTable();
      document.getElementById("showQuizzes").classList.add("btn-primary");
      document.getElementById("showQuizzes").classList.remove("btn-outline-primary");
      document.getElementById("showCourses").classList.add("btn-outline-primary");
      document.getElementById("showCourses").classList.remove("btn-primary");
    });

    //document.getElementById("showAssessments").addEventListener("click", () => {
      //renderAssessmentsTable();
      //document.getElementById("showAssessments").classList.add("btn-primary");
      //document.getElementById("showAssessments").classList.remove("btn-outline-primary");
      //document.getElementById("showCourses").classList.add("btn-outline-primary");
      //document.getElementById("showCourses").classList.remove("btn-primary");
    //});

  } catch (err) {
    console.error("Error loading user analytics:", err);
    container.innerHTML = `<div class="alert alert-danger">Failed to load analytics: ${err.message}</div>`;
  }
}

async function renderCoursesAnalytics(container) {
  renderAnalyticsLayout(container, "courses", `<div class="text-muted">Courses analytics coming soon...</div>`);
}

async function renderAssessmentsAnalytics(container) {
  renderAnalyticsLayout(container, "assessments", `<div class="text-muted">Assessments analytics coming soon...</div>`);
}

async function renderActivityAnalytics(container) {
  renderAnalyticsLayout(container, "activity", `<div class="text-muted">Activity analytics coming soon...</div>`);
}