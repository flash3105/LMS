
const API_BASE_URL = window.API_BASE_URL || 'https://lms-cav9.onrender.com/api';

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
  container.innerHTML = `
    <div class="reports-page card">
      <h2 class="card-header"><i class="fas fa-chart-line"></i> LMS Reports & Analytics</h2>
      <div class="card-body">
        <button id="backButton" class="btn btn-secondary mb-3">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <ul>
          <li>User progress over time</li>
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

  document.getElementById('backButton').addEventListener('click', () => {
    renderHomeTab(container, { name: 'User', role: 'user' }); // Replace with actual currentUser
  });
}
