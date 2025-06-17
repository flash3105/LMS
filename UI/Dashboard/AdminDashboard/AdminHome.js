// Import API base URL
const API_BASE_URL = window.API_BASE_URL || 'https://lms-cav9.onrender.com/api';

// Component: Quick Links with Icons and Event Listeners
function renderQuickLinks(currentUser) {
  const links = [
    { id: 'viewUsersLink', text: 'View All Users', icon: 'users', role: 'admin' },
    { id: 'manageCoursesLink', text: 'Manage Courses', icon: 'book', role: 'admin' },
    { id: 'viewReportsLink', text: 'View Reports', icon: 'chart-bar', role: 'admin' },
    { id: 'myProgressLink', text: 'My Progress', icon: 'user', role: 'user' },
    { id: 'myCoursesLink', text: 'My Courses', icon: 'book-open', role: 'all' }
  ];

  return `
    <div class="quick-links card">
      <h2 class="card-header">
        <i class="fas fa-link"></i> Quick Links
      </h2>
      <div class="card-body">
        <ul class="link-list">
          ${links
            .filter(link => link.role === 'all' || 
                    (currentUser.role === 'admin' && link.role === 'admin') ||
                    (currentUser.role !== 'admin' && link.role === 'user'))
            .map(link => `
              <li>
                <a href="#" id="${link.id}" class="link-item">
                  <i class="fas fa-${link.icon}"></i>
                  ${link.text}
                </a>
              </li>
            `).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Component: Statistics with Real Data
async function renderStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/Statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    const stats = await response.json();

    return `
      <div class="statistics card">
        <h2 class="card-header">
          <i class="fas fa-chart-pie"></i> System Statistics
        </h2>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-card bg-primary">
              <i class="fas fa-users"></i>
              <div>
                <h3>Total Users</h3>
                <p>${stats.totalUsers || 0}</p>
              </div>
            </div>
            <div class="stat-card bg-success">
              <i class="fas fa-user-check"></i>
              <div>
                <h3>Active Users</h3>
                <p>${stats.activeUsers || 0}</p>
              </div>
            </div>
            <div class="stat-card bg-info">
              <i class="fas fa-book"></i>
              <div>
                <h3>Total Courses</h3>
                <p>${stats.totalCourses || 0}</p>
              </div>
            </div>
            <div class="stat-card bg-warning">
              <i class="fas fa-tasks"></i>
              <div>
                <h3>Pending Assessments</h3>
                <p>${stats.pendingAssessments || 0}</p>
              </div>
            </div>
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
  } catch (error) {
    console.error('Error loading statistics:', error);
    return `
      <div class="statistics card">
        <div class="alert alert-danger">
          Failed to load statistics: ${error.message}
        </div>
      </div>
    `;
  }
}

// Component: Announcements with API Data
async function renderAnnouncements() {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`);
    const announcements = response.ok ? await response.json() : [
      { message: "System maintenance scheduled for April 30th.", date: "2023-04-25" },
      { message: "New course templates available in the library.", date: "2023-04-20" },
      { message: "Submit monthly reports by April 25th.", date: "2023-04-15" }
    ];

    return `
      <div class="announcements card">
        <h2 class="card-header">
          <i class="fas fa-bullhorn"></i> Announcements
          <button class="btn btn-sm btn-outline-primary new-announcement">
            <i class="fas fa-plus"></i> New
          </button>
        </h2>
        <div class="card-body">
          <ul class="announcement-list">
            ${announcements.map(announcement => `
              <li class="announcement-item">
                <div class="announcement-content">
                  <p>${announcement.message}</p>
                  <small class="text-muted">Posted: ${new Date(announcement.date).toLocaleDateString()}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger delete-announcement" data-id="${announcement._id || ''}">
                  <i class="fas fa-trash"></i>
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading announcements:', error);
    return `
      <div class="announcements card">
        <div class="alert alert-warning">
          Failed to load announcements. Using sample data.
        </div>
      </div>
    `;
  }
}

// Component: Recent Activity with Real Data
async function renderRecentActivity() {
  try {
    const response = await fetch(`${API_BASE_URL}/activity`);
    const activities = response.ok ? await response.json() : [
      { action: "enrolled in 'JavaScript Basics'", user: "John Doe", time: "2023-04-22T10:30:00Z" },
      { action: "added new course 'Advanced Python'", user: "Admin", time: "2023-04-21T14:15:00Z" },
      { action: "graded assessment 'Midterm Exam'", user: "System", time: "2023-04-20T18:45:00Z" }
    ];

    return `
      <div class="recent-activity card">
        <h2 class="card-header">
          <i class="fas fa-history"></i> Recent Activity
        </h2>
        <div class="card-body">
          <ul class="activity-list">
            ${activities.map(activity => `
              <li class="activity-item">
                <i class="fas fa-circle activity-bullet"></i>
                <div class="activity-content">
                  <strong>${activity.user}</strong> ${activity.action}
                  <small class="text-muted">${new Date(activity.time).toLocaleString()}</small>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading activity:', error);
    return `
      <div class="recent-activity card">
        <div class="alert alert-warning">
          Failed to load recent activity. Using sample data.
        </div>
      </div>
    `;
  }
}

// Main Function: Render Home Tab with Dynamic Layout
export async function renderHomeTab(container, currentUser) {
  // Show loading state
  container.innerHTML = `
    <div id="homeContent" class="dashboard-loading">
      <h1>Loading Dashboard...</h1>
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;

  try {
    // Load all components in parallel
    const [quickLinks, statistics, announcements, recentActivity] = await Promise.all([
      renderQuickLinks(currentUser),
      renderStatistics(),
      renderAnnouncements(),
      renderRecentActivity()
    ]);

    container.innerHTML = `
      <div id="homeContent" class="dashboard-home">
        <div class="dashboard-header">
          <h1>Welcome, ${currentUser.name}!</h1>
          <p class="text-muted">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="dashboard-grid">
          <div class="grid-col-1">
            ${quickLinks}
            ${statistics}
          </div>
          <div class="grid-col-2">
            ${announcements}
            ${recentActivity}
          </div>
        </div>
      </div>
    `;

    // Add event listeners after rendering
    setupDashboardInteractions(currentUser);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    container.innerHTML = `
      <div class="alert alert-danger">
        <h2>Failed to load dashboard</h2>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
}

// Setup all dashboard interactions
function setupDashboardInteractions(currentUser) {
  // Quick Links navigation
  document.querySelectorAll('.link-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const linkId = e.currentTarget.id;
      switch(linkId) {
        case 'viewUsersLink':
          // Implement user view functionality
          console.log('View users clicked');
          break;
        case 'manageCoursesLink':
          // Implement course management
          console.log('Manage courses clicked');
          break;
        case 'viewReportsLink':
          // Implement reports view
          console.log('View reports clicked');
          break;
        case 'myProgressLink':
          // View personal progress
          console.log('My progress clicked');
          break;
        case 'myCoursesLink':
          // View enrolled courses
          console.log('My courses clicked');
          break;
      }
    });
  });

  // Statistics refresh button
  const refreshBtn = document.querySelector('.refresh-stats');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      const statsContainer = document.querySelector('.statistics .card-body');
      const originalContent = statsContainer.innerHTML;
      
      try {
        const response = await fetch(`${API_BASE_URL}/Statistics`);
        if (!response.ok) throw new Error('Failed to fetch updated statistics');
        const stats = await response.json();
        
        statsContainer.querySelector('.stat-card:nth-child(1) p').textContent = stats.totalUsers || 0;
        statsContainer.querySelector('.stat-card:nth-child(2) p').textContent = stats.activeUsers || 0;
        statsContainer.querySelector('.stat-card:nth-child(3) p').textContent = stats.totalCourses || 0;
        statsContainer.querySelector('.stat-card:nth-child(4) p').textContent = stats.pendingAssessments || 0;
        
        document.querySelector('.update-time').innerHTML = `
          Last updated: ${new Date().toLocaleTimeString()}
          <button class="btn btn-sm btn-outline-secondary refresh-stats">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        `;
        setupDashboardInteractions(currentUser); // Rebind event listeners
      } catch (error) {
        statsContainer.innerHTML = originalContent;
        alert(`Failed to refresh: ${error.message}`);
      }
    });
  }

  // Announcement management
  document.querySelectorAll('.delete-announcement').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this announcement?')) {
        const announcementId = e.currentTarget.dataset.id;
        if (announcementId) {
          try {
            const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
              method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete announcement');
            e.currentTarget.closest('.announcement-item').remove();
          } catch (error) {
            alert(`Failed to delete: ${error.message}`);
          }
        } else {
          e.currentTarget.closest('.announcement-item').remove();
        }
      }
    });
  });

  // New announcement button
  const newAnnouncementBtn = document.querySelector('.new-announcement');
  if (newAnnouncementBtn) {
    newAnnouncementBtn.addEventListener('click', () => {
      const message = prompt('Enter your announcement:');
      if (message) {
        const announcementList = document.querySelector('.announcement-list');
        const newItem = document.createElement('li');
        newItem.className = 'announcement-item';
        newItem.innerHTML = `
          <div class="announcement-content">
            <p>${message}</p>
            <small class="text-muted">Posted: ${new Date().toLocaleDateString()}</small>
          </div>
          <button class="btn btn-sm btn-outline-danger delete-announcement">
            <i class="fas fa-trash"></i>
          </button>
        `;
        announcementList.prepend(newItem);
        setupDashboardInteractions(currentUser); // Rebind event listeners
      }
    });
  }
}