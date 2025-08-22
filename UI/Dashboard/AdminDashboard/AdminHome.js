
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

    // Render
    container.innerHTML = `
      <div class="reports-page card">
        <h2 class="card-header"><i class="fas fa-chart-line"></i> LMS Reports & Analytics</h2>
        <div class="card-body">
          <button id="backButton" class="btn btn-secondary mb-3">
            <i class="fas fa-arrow-left"></i> Back
          </button>
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
            <li>Top-performing courses</li>
            <li>Engagement rates</li>
            <li>Assessment results and trends</li>
            <li>Active vs inactive users</li>
          </ul>
          <div class="text-muted mt-3">
            <i class="fas fa-spinner fa-spin"></i> More analytics coming soon...
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
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

  try {
    // Fetch quizzes + submissions for each course
    const coursesWithQuizzes = await Promise.all(
      userData.enrolledCourses.map(async (course) => {
        try {
          const quizzesRes = await fetch(`${API_BASE_URL}/courses/${course._id}/quizzes`);
          const quizzes = quizzesRes.ok ? await quizzesRes.json() : [];

          const assRes = await fetch(`${API_BASE_URL}/courses/${course._id}/assessments`);
          const assessments = assRes.ok ? await assRes.json() : [];

          // Fetch quiz submissions for this course + user
          const quizSubsRes = await fetch(`http://localhost:5000/api/submissions/${course._id}/${encodeURIComponent(email)}`);
          const QuizSubmissions = quizSubsRes.ok ? await quizSubsRes.json() : [];

          const assSubsRes = await fetch(`${API_BASE_URL}/course/${course._id}/${encodeURIComponent(email)}`);
          const assignmentSubmissions = assSubsRes.ok ? await assSubsRes.json() : [];

          console.log("Quiz Submissions: ", QuizSubmissions);
          console.log("Assignment submissions: ", assignmentSubmissions);

          // Count quizzes that have submissions
          const quizzesTaken = quizzes.filter(q =>
            QuizSubmissions.some(s => s.quizId === q._id)
          ).length;

          const assignemntsSubmitted = assessments.filter(a =>
            assignmentSubmissions.some(s => s.assessmentId === a._id)
          ).length;

          const totalQuizzes = quizzes.length;
          const totalAssessments = assessments.length;

          return {
            ...course,
            quizzesTaken,
            totalQuizzes,
            assignemntsSubmitted,
            totalAssessments,
            progress: course.progress || 0,
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
          </div>
          <div>
            <button id="showCourses" class="btn btn-primary">Courses</button>
            <!--<button id="showAssessments" class="btn btn-outline-primary">Assessments</button> -->
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
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            ${coursesWithQuizzes.map(c => `
              <tr>
                <td>${c.courseName}</td>
                <td>${c.quizzesTaken} / ${c.totalQuizzes}</td>
                <td>${c.assignemntsSubmitted} / ${c.totalAssessments}</td>
                <td>
                  <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${c.progress || 0}%">
                      ${c.progress || 0}%
                    </div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
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
              <th>Assessment</th>
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
      document.getElementById("showAssessments").classList.add("btn-outline-primary");
      document.getElementById("showAssessments").classList.remove("btn-primary");
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







