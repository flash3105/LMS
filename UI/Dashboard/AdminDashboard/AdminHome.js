
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


async function renderReportsPage(container, pageSize = 20) {
  try {
    // Render skeleton table immediately
    renderAnalyticsLayout(container, "user", `
      <div id="kpi-cards" style="display:flex; gap:1rem; margin-bottom:1rem;">
        <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.5rem; text-align:center;">
          <h5>Total Enrolled Courses</h5>
          <p id="total-courses" style="font-weight:bold; font-size:1.5rem; margin:0;">--</p>
        </div>
        <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.5rem; text-align:center;">
          <h5>Completed Courses</h5>
          <p id="total-completed" style="font-weight:bold; font-size:1.5rem; margin:0;">--</p>
        </div>
        <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.5rem; text-align:center;">
          <h5>Overall Progress</h5>
          <svg width="100" height="100" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e0e0" stroke-width="3"/>
            <path id="progress-path" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2196f3" stroke-width="3" stroke-dasharray="0,100"/>
            <text id="progress-text" x="18" y="20.35" text-anchor="middle" font-size="6" fill="#333">--%</text>
          </svg>
        </div>
      </div>
      <div style="max-height:300px; overflow:auto; border:1px solid #ccc; border-radius:8px; display:inline-block;">
        <table class="table table-striped" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Total Courses</th>
              <th>Completed Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-table-body">
            <tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>
          </tbody>
        </table>
      </div>
      <div id="pagination" style="margin-top:1rem; text-align:center;"></div>
    `);

    const tbody = document.getElementById("users-table-body");
    const paginationContainer = document.getElementById("pagination");

    // STEP 1: Fetch users
    const usersRes = await fetch(`${API_BASE_URL}/auth/registered-users`);
    const users = await usersRes.json();
    const studentUsers = users.users.filter(u => u.role === "Student" || u.role === "Intern");
    const totalPages = Math.ceil(studentUsers.length / pageSize);

    // Initialize placeholders
    studentUsers.forEach(u => {
      u.courseCount = 0;
      u.completedCount = 0;
    });

    function updateKPI() {
      const totalCoursesEl = document.getElementById("total-courses");
      const totalCompletedEl = document.getElementById("total-completed");
      const progressTextEl = document.getElementById("progress-text");
      const progressPathEl = document.getElementById("progress-path");

      if (!totalCoursesEl || !totalCompletedEl || !progressTextEl || !progressPathEl) return;

      const totalCourses = studentUsers.reduce((sum, u) => sum + u.courseCount, 0);
      const totalCompleted = studentUsers.reduce((sum, u) => sum + u.completedCount, 0);
      const overallProgress = totalCourses ? Math.round((totalCompleted / totalCourses) * 100) : 0;

      totalCoursesEl.textContent = totalCourses;
      totalCompletedEl.textContent = totalCompleted;
      progressTextEl.textContent = overallProgress + "%";
      progressPathEl.setAttribute("stroke-dasharray", `${overallProgress},100`);
    }


    function renderPage(page) {
      const start = (page - 1) * pageSize;
      const pageUsers = studentUsers.slice(start, start + pageSize);
      tbody.innerHTML = pageUsers.map((u, i) => `
        <tr>
          <td>${start + i + 1}</td>
          <td>${u.email}</td>
          <td>${u.name}</td>
          <td>${u.role}</td>
          <td>${u.courseCount}</td>
          <td>${u.completedCount}</td>
          <td><button class="btn btn-primary btn-sm details-btn" data-email="${u.email}">Details</button></td>
        </tr>
      `).join("");

      document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", async e => await renderUserAnalytics(container, e.currentTarget.dataset.email));
      });

      paginationContainer.innerHTML = "";
      for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.textContent = p;
        btn.className = p === page ? "btn btn-primary btn-sm mx-1" : "btn btn-secondary btn-sm mx-1";
        btn.addEventListener("click", () => renderPage(p));
        paginationContainer.appendChild(btn);
      }
    }

    renderPage(1); // Initial render with placeholders

    // STEP 2: Fetch each user's courses (in parallel) and update KPI incrementally
    await Promise.all(studentUsers.map(async u => {
      try {
        const res = await fetch(`http://localhost:5000/api/mycourses/${encodeURIComponent(u.email)}`);
        const data = res.ok ? await res.json() : { enrolledCourses: [] };
        u.courseCount = data.enrolledCourses.length;
        u.completedCount = data.enrolledCourses.filter(c => c.status === 'completed').length;
        updateKPI();
        renderPage(1); // re-render current page with updated data
      } catch (err) {
        console.error(`Failed to fetch courses for ${u.email}:`, err);
      }
    }));

  } catch (err) {
    console.error("Statistics load error:", err);
    container.innerHTML = `<div class="statistics card"><div class="alert alert-danger">Failed to load statistics: ${err.message}</div></div>`;
  }

  document.getElementById("backButton")?.addEventListener("click", () => {
    renderHomeTab(container, { name: "User", role: "user" });
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

          //Fetches assignments for this course and user
          const assRes = await fetch(`${API_BASE_URL}/courses/${course._id}/assessments`);
          const assessments = assRes.ok ? await assRes.json() : [];

          // Fetches quiz submissions for this course and user
          const quizSubsRes = await fetch(`http://localhost:5000/api/submissions/${course._id}/${encodeURIComponent(email)}`);
          const QuizSubmissions = quizSubsRes.ok ? await quizSubsRes.json() : [];

          //Fetches assignments submissions for this course and user
          const assSubsRes = await fetch(`${API_BASE_URL}/course/${course._id}/${encodeURIComponent(email)}`);
          const assignmentSubmissions = assSubsRes.ok ? await assSubsRes.json() : [];

          //Fetches all the resources in a course
          const resourceRes = await fetch(`${API_BASE_URL}/courses/${course._id}/resources`);
          const resources = await resourceRes.json();

          //Fetches a user using their email
          const res = await fetch(`http://localhost:5000/api/email/${encodeURIComponent(email)}`);
          if (!res.ok) throw new Error('User not found');
          const user = await res.json();
          console.log('Fetched user:', user);

          //Fetches all the completed resources for a user
          const compRes = await fetch(`http://localhost:5000/api/resources/completions/${user._id}`);
          const completions = (await compRes.json()).filter(c =>
            resources.some(r => r._id === c.resource)
          );

          //Fetches each enrolled course of a user
          const courseRes = await fetch(`http://localhost:5000/api/mycourses/${encodeURIComponent(email)}/course/${course._id}`)
          const enrolledCourse = await courseRes.json();

          console.log("The course: ", enrolledCourse);

          // Count quizzes that have submissions
          const quizzesTaken = quizzes.filter(q =>
            QuizSubmissions.some(s => s.quizId === q._id)
          );

          allQuizzesTaken.push(...quizzesTaken);

          const assignemntsSubmitted = assessments.filter(a =>
            assignmentSubmissions.some(s => s.assessmentId === a._id)
          ).length;

          const totalQuizzes = quizzes.length;
          const totalAssessments = assessments.length;

          const completedResources = completions.length
          const allResources = resources.length;

          return {
            ...course,
            quizzesTaken: quizzesTaken.length || 0,
            totalQuizzes,
            assignemntsSubmitted,
            totalAssessments,
            completedResources,
            allResources,
            progress: enrolledCourse.course?.progress ?? 0,
            status: enrolledCourse.course?.status ?? 'enrolled',
            assessments
          };
        } catch (err) {
          console.error('Failed fetching for', course.courseName, err);
          return { ...course, quizzesTaken: 0, totalQuizzes: 0, assignemntsSubmitted: 0, totalAssessments: 0, progress: course.progress ?? 0, status: course.status ?? 'enrolled', assessments: [] };
        }
      })
    );
    
    const totalCourses = userData.enrolledCourses.length;
    const totalQuizzes = coursesWithQuizzes.reduce((sum, c) => sum + (c.quizzesTaken || 0), 0);
    const totalAssignments = coursesWithQuizzes.reduce((sum, c) => sum + (c.assignemntsSubmitted || 0), 0);
    const completedCourses = coursesWithQuizzes.filter(course => course.progress === 100).length;
    const notStartedCourses = coursesWithQuizzes.filter(course => course.progress === 0).length;
    const inProgressCourses = coursesWithQuizzes.filter(course => course.progress > 0 && course.progress < 100).length;
    const completedResources = coursesWithQuizzes.reduce((sum, c) => sum + (c.completedResources || 0), 0);

    const overallProgress = totalCourses > 0 
      ? Math.round((completedCourses / totalCourses) * 100) 
      : 0;

    // Base UI with buttons and KPIs
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
          <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap: wrap;">

          <!-- Overall Progress Wheel -->
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Overall Progress</h6>
            <svg width="80" height="80" viewBox="0 0 36 36" style="margin:0 auto;">
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e0e0e0"
                stroke-width="3"
              />
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2196f3"
                stroke-width="3"
                stroke-dasharray="${overallProgress}, 100"
              />
              <text x="18" y="20.35" text-anchor="middle" font-size="5" fill="#333">
                ${overallProgress}%
              </text>
            </svg>
          </div>

          <!-- Other KPI Cards -->
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Enrolled Courses</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${totalCourses}</p>
          </div>
  
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Completed Courses</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${completedCourses}</p>
          </div>
  
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">In Progress</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${inProgressCourses}</p>
          </div>
  
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Not Started</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${notStartedCourses}</p>
          </div>

          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Quizzes Taken</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${totalQuizzes}</p>
          </div>
  
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Assignments Submitted</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${totalAssignments}</p>
          </div>
  
          <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:100px;">
            <h6 style="margin:0 0 0.2rem 0;">Resources Completed</h6>
            <p style="font-weight:bold; font-size:1.2rem; margin:0;">${completedResources}</p>
          </div>

        </div>

        <div>
          <button id="showCourses" class="btn btn-primary">Courses</button>
        <!-- <button id="showQuizzes" class="btn btn-outline-primary">Quizzes</button> -->
        </div>

        <div id="tableContainer"></div>
      </div>
    </div>
  `;

    // Courses Table and Chart side by side
    const tableChartContainer = document.createElement("div");
    tableChartContainer.style.display = "flex";
    tableChartContainer.style.gap = "20px"; // space between table and chart

    // Table
    const tableDiv = document.createElement("div");
    tableDiv.style.flex = "1"; // table takes remaining width
    tableDiv.id = "tableContainer"; 
    tableChartContainer.appendChild(tableDiv);

    // Chart
    const chartDiv = document.createElement("div");
    chartDiv.style.width = "300px"; // fixed width for chart
    chartDiv.innerHTML = `<canvas id="statusChart"></canvas>`;
    tableChartContainer.appendChild(chartDiv);


    // Append the container to card body
    container.querySelector(".card-body").appendChild(tableChartContainer);

    console.log("Courses with quizzes: ", coursesWithQuizzes)
    // Courses Table
    function renderCoursesTable() {
      tableDiv.innerHTML = `
        <div style="display:inline-block; max-height: 300px; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; padding: 8px;">
          <table class="table table-striped" style="margin:0;">
            <thead>
              <tr>
                <th>Course</th>
                <th>Quizzes Taken</th>
                <th>Assignments Done</th>
                <th>Resources completed</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${coursesWithQuizzes.map(c => `
                <tr>
                  <td>${c.courseName}</td>
                  <td>${c.quizzesTaken} / ${c.totalQuizzes}</td>
                  <td>${c.assignemntsSubmitted} / ${c.totalAssessments}</td>
                  <td>${c.completedResources} / ${c.allResources}</td>
                  <td>
                    <div class="progress" style="width:100%; background:#eee; border:1px solid #ccc; border-radius:5px; height:12px; position:relative; overflow:hidden;">
                      <div class="progress-bar" role="progressbar" style="width: ${c.progress || 0}%; background:#2196f3; height:100%;"></div>
                      <span style="position:absolute; top:0; left:50%; transform:translateX(-50%); font-size:10px; line-height:12px; font-weight:bold; color:#000;">
                        ${c.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td>${c.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Dynamically load Chart.js if not already loaded
    async function loadChartJS() {
      if (typeof Chart !== "undefined") return; // already loaded

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Add this at the end of your renderUserAnalytics function
    await loadChartJS(); // ensure Chart.js is loaded

    // Add a container for the chart
    const chartContainer = document.createElement("div");
    chartContainer.style.width = "300px";
    chartContainer.style.marginTop = "20px";
    chartContainer.innerHTML = `<canvas id="statusChart"></canvas>`;
    container.querySelector(".card-body").appendChild(chartContainer);

    // Build status counts
    const statusCounts = coursesWithQuizzes.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      if(acc[c.status] === "enrolled"){
        acc[c.status] = "not started";
      }
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const ctx = document.getElementById("statusChart").getContext("2d");

    // Destroy previous chart if exists
    if (window.statusChartInstance) {
      window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(ctx, {
      type: "doughnut",
        data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#2196f3"],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true }
        }
      }
    });

    function renderQuizzesTable() {
      // Clear the container first
      tableContainer.innerHTML = "<p>Loading quizzes...</p>";

       if (document.getElementById("chartContainer")) {
    chartDiv.remove();
  }

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

        tableDiv.innerHTML = `
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

    /*
    document.getElementById("showQuizzes").addEventListener("click", () => {
      renderQuizzesTable();
      document.getElementById("showQuizzes").classList.add("btn-primary");
      document.getElementById("showQuizzes").classList.remove("btn-outline-primary");
      document.getElementById("showCourses").classList.add("btn-outline-primary");
      document.getElementById("showCourses").classList.remove("btn-primary");
    });
    */
   
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