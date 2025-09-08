import { fetchUserData } from "../Data/data.js";
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Render Quick Links based on user role

function renderQuickLinks(currentUser) {
  fetchUserData();
  const links = [
    { id: 'viewReportsLink', text: 'View Reports', icon: 'chart-bar', role: 'user' },
    { id: 'institutions-link', text: 'Institutions', icon: 'university', role: 'Admin'}  

  ];

  return `
    <div class="quick-links card">
      <h2 class="card-header"><i class="fas fa-link"></i> Quick Links</h2>
      <div class="card-body">
        <ul class="link-list">
          ${links
            .filter(link => link.role === 'all' || (currentUser.role === 'Admin' && link.role === 'Admin') || (currentUser.role !== 'admin' && link.role === 'user'))
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
    const [quickLinks] = await Promise.all([
      renderQuickLinks(currentUser),
    
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
          <div class="grid-col-1">${quickLinks}</div>
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
        case 'institutions-link':
          renderInstitutionsPage(document.getElementById('contentArea'));
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
    renderHomeTab(container, { name: "User", role: "user" }); // 
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

    const usersRes = await fetch(`${API_BASE_URL}/auth/registered-users`);
    const users = await usersRes.json();
    const studentUsers = users.users.filter(u => u.role === "Student" || u.role === "Intern");
    const totalPages = Math.ceil(studentUsers.length / pageSize);

    // Initialise placeholders
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

    renderPage(1); //Initial render with placeholders

    //Fetch each user's courses (in parallel) and update KPI incrementally
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

// renders institutions
async function renderInstitutionsPage(container) {
  container.innerHTML = `
    <div class="institutions-page card">
      <h2 class="card-header"><i class="fas fa-university"></i> Institutions Management</h2>
      <div class="card-body">
        <button id="backButton" class="btn btn-secondary mb-3">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div class="d-flex justify-content-between mb-3">
          <button id="addInstitutionBtn" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add New Institution
          </button>
          <div class="input-group" style="width: 300px;">
            <input type="text" id="institutionSearch" class="form-control" placeholder="Search institutions...">
            <button class="btn btn-outline-secondary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div id="institutionsContent">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin"></i> Loading institutions...
          </div>
        </div>
      </div>
    </div>
  `;

  // Back button
  document.getElementById("backButton").addEventListener("click", () => {
    renderHomeTab(container, { name: "Admin", role: "Admin" });
  });

  // Add institution button
  document.getElementById("addInstitutionBtn").addEventListener("click", () => {
    showAddInstitutionForm();
  });

  // Search functionality
  document.getElementById("institutionSearch").addEventListener("input", (e) => {
    filterInstitutions(e.target.value);
  });

  // Load institutions
  await loadInstitutions();
}

// Function to load institutions
async function loadInstitutions() {
  try {
    console.log('Loading institutions from:', `${API_BASE_URL}/institutions`);
    
    const response = await fetch(`${API_BASE_URL}/institutions`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch institutions: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('API Response:', responseData);
    console.log('Type of response:', typeof responseData);
    
    // Check if response is an array
    if (!Array.isArray(responseData)) {
      console.error('Expected array but got:', responseData);
      throw new Error('API did not return an array of institutions');
    }
    
    const institutions = responseData;
    console.log('Institutions loaded:', institutions);
    renderInstitutionsTable(institutions);
  } catch (err) {
    console.error('Error loading institutions:', err);
    document.getElementById("institutionsContent").innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i> Failed to load institutions: ${err.message}
      </div>
    `;
  }
}

// Function to render the institutions table
function renderInstitutionsTable(institutions) {
  // Ensure institutions is always an array
  if (!Array.isArray(institutions)) {
    console.error('renderInstitutionsTable expected array but got:', institutions);
    institutions = [];
  }

  if (institutions.length === 0) {
    document.getElementById("institutionsContent").innerHTML = `
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i> No institutions found. 
        <a href="#" id="addFirstInstitution">Add the first institution</a>
      </div>
    `;
    
    document.getElementById("addFirstInstitution").addEventListener("click", (e) => {
      e.preventDefault();
      showAddInstitutionForm();
    });
    
    return;
  }

  document.getElementById("institutionsContent").innerHTML = `
    <div style="max-height: 500px; overflow-y: auto;">
      <table class="table table-striped table-hover">
        <thead class="sticky-top bg-light">
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Onboarding Grade</th>
            <th>Province</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${institutions.map(institution => `
            <tr>
              <td>${institution.institutionName || 'N/A'}</td>
              <td>${institution.institutionType || 'N/A'}</td>
              <td>${institution.onboardingGrade || 'N/A'}</td>
              <td>${institution.province || 'N/A'}</td>
              <td>${institution.email || 'N/A'}</td>
              <td>${institution.contactNumber || 'N/A'}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${institution._id}">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${institution._id}">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Add event listeners for edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const institutionId = e.currentTarget.dataset.id;
      editInstitution(institutionId);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const institutionId = e.currentTarget.dataset.id;
      deleteInstitution(institutionId);
    });
  });
}

// Function to show the add institution form
function showAddInstitutionForm() {
  document.getElementById("institutionsContent").innerHTML = `
    <div class="card">
      <div class="card-header">
        <h5><i class="fas fa-plus"></i> Add New Institution</h5>
      </div>
      <div class="card-body">
        <form id="addInstitutionForm">
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="institutionName" class="form-label">Institution Name *</label>
              <input type="text" class="form-control" id="institutionName" required>
            </div>
            <div class="col-md-6">
              <label for="institutionType" class="form-label">Institution Type *</label>
              <select class="form-select" id="institutionType" required>
                <option value="">Select Type</option>
                <option value="primary school">Primary School</option>
                <option value="secondary school">Secondary School</option>
                <option value="college">College</option>
                <option value="university">University</option>
              </select>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="onboardingGrade" class="form-label">Onboarding Grade</label>
              <input type="text" class="form-control" id="onboardingGrade">
            </div>
            <div class="col-md-6">
              <label for="province" class="form-label">Province *</label>
              <select class="form-select" id="province" required>
                <option value="">Select Province</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Free State">Free State</option>
                <option value="Gauteng">Gauteng</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                <option value="Limpopo">Limpopo</option>
                <option value="Mpumalanga">Mpumalanga</option>
                <option value="Northern Cape">Northern Cape</option>
                <option value="North West">North West</option>
                <option value="Western Cape">Western Cape</option>
              </select>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="address" class="form-label">Address *</label>
              <textarea class="form-control" id="address" rows="2" required></textarea>
            </div>
            <div class="col-md-6">
              <label for="email" class="form-label">Email *</label>
              <input type="email" class="form-control" id="email" required>
              <label for="contactNumber" class="form-label mt-2">Contact Number</label>
              <input type="tel" class="form-control" id="contactNumber">
            </div>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Save Institution
            </button>
            <button type="button" id="cancelAddBtn" class="btn btn-secondary">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Form submission
  document.getElementById("addInstitutionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveInstitution();
  });

  // Cancel button
  document.getElementById("cancelAddBtn").addEventListener("click", () => {
    loadInstitutions();
  });
}

// Function to save a new institution
async function saveInstitution() {
  const formData = {
    institutionName: document.getElementById("institutionName").value,
    institutionType: document.getElementById("institutionType").value,
    onboardingGrade: document.getElementById("onboardingGrade").value,
    province: document.getElementById("province").value,
    address: document.getElementById("address").value,
    email: document.getElementById("email").value,
    contactNumber: document.getElementById("contactNumber").value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save institution');
    }

    alert('Institution saved successfully!');
    loadInstitutions();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Function to edit an institution
async function editInstitution(institutionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`);
    if (!response.ok) throw new Error('Failed to fetch institution');
    
    const institution = await response.json();
    
    document.getElementById("institutionsContent").innerHTML = `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-edit"></i> Edit Institution</h5>
        </div>
        <div class="card-body">
          <form id="editInstitutionForm">
            <input type="hidden" id="editInstitutionId" value="${institution._id}">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="editInstitutionName" class="form-label">Institution Name *</label>
                <input type="text" class="form-control" id="editInstitutionName" value="${institution.institutionName}" required>
              </div>
              <div class="col-md-6">
                <label for="editInstitutionType" class="form-label">Institution Type *</label>
                <select class="form-select" id="editInstitutionType" required>
                  <option value="primary school" ${institution.institutionType === 'primary school' ? 'selected' : ''}>Primary School</option>
                  <option value="secondary school" ${institution.institutionType === 'secondary school' ? 'selected' : ''}>Secondary School</option>
                  <option value="college" ${institution.institutionType === 'college' ? 'selected' : ''}>College</option>
                  <option value="university" ${institution.institutionType === 'university' ? 'selected' : ''}>University</option>
                </select>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="editOnboardingGrade" class="form-label">Onboarding Grade</label>
                <input type="text" class="form-control" id="editOnboardingGrade" value="${institution.onboardingGrade || ''}">
              </div>
              <div class="col-md-6">
                <label for="editProvince" class="form-label">Province *</label>
                <input type="text" class="form-control" id="editProvince" value="${institution.province}" required>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="editAddress" class="form-label">Address *</label>
                <textarea class="form-control" id="editAddress" rows="2" required>${institution.address}</textarea>
              </div>
              <div class="col-md-6">
                <label for="editEmail" class="form-label">Email *</label>
                <input type="email" class="form-control" id="editEmail" value="${institution.email}" required>
                <label for="editContactNumber" class="form-label mt-2">Contact Number</label>
                <input type="tel" class="form-control" id="editContactNumber" value="${institution.contactNumber || ''}">
              </div>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Update Institution
              </button>
              <button type="button" id="cancelEditBtn" class="btn btn-secondary">
                <i class="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Form submission
    document.getElementById("editInstitutionForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateInstitution(institutionId);
    });

    // Cancel button
    document.getElementById("cancelEditBtn").addEventListener("click", () => {
      loadInstitutions();
    });
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Function to update an institution
async function updateInstitution(institutionId) {
  const formData = {
    institutionName: document.getElementById("editInstitutionName").value,
    institutionType: document.getElementById("editInstitutionType").value,
    onboardingGrade: document.getElementById("editOnboardingGrade").value,
    province: document.getElementById("editProvince").value,
    address: document.getElementById("editAddress").value,
    email: document.getElementById("editEmail").value,
    contactNumber: document.getElementById("editContactNumber").value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update institution');
    }

    alert('Institution updated successfully!');
    loadInstitutions();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Function to delete an institution
async function deleteInstitution(institutionId) {
  if (!confirm('Are you sure you want to delete this institution?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete institution');
    }

    alert('Institution deleted successfully!');
    loadInstitutions();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Function to filter institutions
function filterInstitutions(searchTerm) {
  const rows = document.querySelectorAll('#institutionsContent tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

async function renderUserAnalytics(container, email) {
  let userData = { name: 'Unknown User', enrolledCourses: [] };
  let user = null;
  let allCompletions = [];
  let allQuizzesTaken = [];

  try {
    const res = await fetch(`${API_BASE_URL}/mycourses/${encodeURIComponent(email)}`);
    if (res.ok) userData = await res.json();
  } catch (err) {
    console.warn('Failed to fetch user courses:', err);
  }

  try {
    const res = await fetch(`http://localhost:5000/api/email/${encodeURIComponent(email)}`);
    if (res.ok) {
      user = await res.json();
      const compRes = await fetch(`http://localhost:5000/api/resources/completions/${user._id}`);
      if (compRes.ok) allCompletions = await compRes.json();
    }
  } catch (err) {
    console.warn('Failed fetching user or completions:', err);
  }

  // Render base UI (KPIs) immediately
  const totalCourses = userData.enrolledCourses.length;
  container.innerHTML = `
    <div class="user-analytics card">
      <div class="mb-3 d-flex gap-2">
        <button id="backToReports" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
      <h2 class="card-header">Analytics for ${userData.name}</h2>
      <div class="card-body">
        <div id="kpiCards" style="display:flex; gap:0.5rem; flex-wrap: wrap;">Loading KPIs...</div>
        <div>
          <button id="showCourses" class="btn btn-primary">Courses</button>
        </div>
        <div style="display:flex; gap:20px; margin-top: 1rem;">
          <div id="tableContainer" style="flex:2;"></div>
          <div id="chartContainer" style="flex:1; min-width:250px;">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;


  document.getElementById("backToReports").addEventListener("click", () => renderReportsPage(container));

  //Fetch per-course details in parallel (6 requests per course) ---
  const coursesWithQuizzes = await Promise.all(
    userData.enrolledCourses.map(async (course) => {
      try {
        const [quizzesRes, assRes, quizSubsRes, assSubsRes, resourceRes, courseRes] = await Promise.all([
          fetch(`${API_BASE_URL}/courses/${course._id}/quizzes`),
          fetch(`${API_BASE_URL}/courses/${course._id}/assessments`),
          fetch(`http://localhost:5000/api/submissions/${course._id}/${encodeURIComponent(email)}`),
          fetch(`${API_BASE_URL}/course/${course._id}/${encodeURIComponent(email)}`),
          fetch(`${API_BASE_URL}/courses/${course._id}/resources`),
          fetch(`http://localhost:5000/api/mycourses/${encodeURIComponent(email)}/course/${course._id}`)
        ]);

        const [quizzes, assessments, quizSubs, assignmentSubs, resources, enrolledCourse] = await Promise.all([
          quizzesRes.ok ? quizzesRes.json() : [],
          assRes.ok ? assRes.json() : [],
          quizSubsRes.ok ? quizSubsRes.json() : [],
          assSubsRes.ok ? assSubsRes.json() : [],
          resourceRes.ok ? resourceRes.json() : [],
          courseRes.ok ? courseRes.json() : {}
        ]);

        // Filter completions efficiently using a Set
        const resourceIds = new Set(resources.map(r => r._id));
        const completions = allCompletions.filter(c => resourceIds.has(c.resource));

        const quizzesTaken = quizzes.filter(q => quizSubs.some(s => s.quizId === q._id));
        allQuizzesTaken.push(...quizzesTaken);

        const assignmentsSubmitted = assessments.filter(a => assignmentSubs.some(s => s.assessmentId === a._id)).length;

        return {
          ...course,
          quizzesTaken: quizzesTaken.length,
          totalQuizzes: quizzes.length,
          assignemntsSubmitted: assignmentsSubmitted,
          totalAssessments: assessments.length,
          completedResources: completions.length,
          allResources: resources.length,
          progress: enrolledCourse.course?.progress ?? 0,
          status: enrolledCourse.course?.status ?? 'enrolled',
          assessments
        };
      } catch (err) {
        console.error('Error fetching course:', course.courseName, err);
        return { ...course, quizzesTaken: 0, totalQuizzes: 0, assignemntsSubmitted: 0, totalAssessments: 0, completedResources: 0, allResources: 0, progress: 0, status: 'enrolled', assessments: [] };
      }
    })
  );

  //Calculate KPI values
  const totalQuizzes = coursesWithQuizzes.reduce((sum, c) => sum + c.quizzesTaken, 0);
  const totalAssignments = coursesWithQuizzes.reduce((sum, c) => sum + c.assignemntsSubmitted, 0);
  const completedCourses = coursesWithQuizzes.filter(c => c.progress === 100).length;
  const notStartedCourses = coursesWithQuizzes.filter(c => c.progress === 0).length;
  const inProgressCourses = coursesWithQuizzes.filter(c => c.progress > 0 && c.progress < 100).length;
  const completedResources = coursesWithQuizzes.reduce((sum, c) => sum + c.completedResources, 0);
  const overallProgress = totalCourses ? Math.round((completedCourses / totalCourses) * 100) : 0;

  //Render KPI cards and prgress wheel
  const kpiCardsDiv = document.getElementById("kpiCards");
  kpiCardsDiv.innerHTML = `
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Overall Progress</h6>
      <svg width="80" height="80" viewBox="0 0 36 36" style="margin:0 auto;">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e0e0" stroke-width="3"/>
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2196f3" stroke-width="3" stroke-dasharray="${overallProgress}, 100"/>
        <text x="18" y="20.35" text-anchor="middle" font-size="5" fill="#333">${overallProgress}%</text>
      </svg>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Enrolled Courses</h6><p style="font-weight:bold">${totalCourses}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Completed Courses</h6><p style="font-weight:bold">${completedCourses}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>In Progress</h6><p style="font-weight:bold">${inProgressCourses}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Not Started</h6><p style="font-weight:bold">${notStartedCourses}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Quizzes Taken</h6><p style="font-weight:bold">${totalQuizzes}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Assignments Submitted</h6><p style="font-weight:bold">${totalAssignments}</p>
    </div>
    <div style="flex:1; border:1px solid #ccc; border-radius:6px; padding:0.3rem; text-align:center;">
      <h6>Resources Completed</h6><p style="font-weight:bold">${completedResources}</p>
    </div>
  `;

  //Render courses table
  const tableDiv = document.getElementById("tableContainer");
  function renderCoursesTable() {
    tableDiv.innerHTML = `
      <div style="max-height:300px; overflow-y:auto; border:1px solid #ccc; border-radius:8px; padding:8px;">
        <table class="table table-striped" style="margin:0;">
          <thead>
            <tr>
              <th>Course</th>
              <th>Quizzes Taken</th>
              <th>Assignments Done</th>
              <th>Resources Completed</th>
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
                  <div class="progress" style="width:100%; background:#eee; border-radius:5px; height:12px; position:relative;">
                    <div class="progress-bar" style="width:${c.progress}%; background:#2196f3; height:100%;"></div>
                    <span style="position:absolute; top:0; left:50%; transform:translateX(-50%); font-size:10px; line-height:12px; font-weight:bold;">${c.progress}%</span>
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

  renderCoursesTable();

  //course status chart
  if (typeof Chart === "undefined") {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const statusCounts = coursesWithQuizzes.reduce((acc, c) => {
    const status = c.status === 'enrolled' ? 'not started' : c.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const ctx = document.getElementById("statusChart").getContext("2d");
  if (window.statusChartInstance) window.statusChartInstance.destroy();
  window.statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: Object.keys(statusCounts), datasets: [{ data: Object.values(statusCounts), backgroundColor: ["#4caf50","#ff9800","#f44336","#2196f3"], borderWidth: 1 }] },
    options: { plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } } }
  });

  document.getElementById("showCourses").addEventListener("click", renderCoursesTable);
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