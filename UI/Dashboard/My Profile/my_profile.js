import { userData } from '../Data/data.js';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export async function renderProfileTab(contentArea, currentUser) {
  let certificates = [];

  // Fetch latest profile from backend (bio + milestones + certificates)
  try {
    const res = await fetch(`${API_BASE_URL}/Profile/${currentUser.email}`);
    if (!res.ok) throw new Error('Failed to fetch profile');

    const profile = await res.json();
    currentUser.bio = profile.bio || '';
    currentUser.milestones = profile.milestones || [];
    certificates = profile.certificates || [];

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } catch (err) {
    console.error('Error fetching profile:', err);
    currentUser.bio = currentUser.bio || '';
    currentUser.milestones = currentUser.milestones || [];
    certificates = [];
  }

  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
  };
  
  // Certificates come from profile fetch earlier
  currentUser.certificates = certificates;

  // Generate milestones list dynamically
  const milestones = currentUser.milestones && currentUser.milestones.length > 0 
      ? currentUser.milestones.map(m => 
          `<li class="milestone-item">
            <i class="fas fa-check-circle"></i>
            <div>
              <strong>${m.title}</strong>
              <div>${m.description}</div>
              <small>${m.achievedOn ? new Date(m.achievedOn).toLocaleDateString() : ''}</small>
            </div>
          </li>`
        ).join('')
      : '<li class="milestone-item"><i class="fas fa-info-circle"></i><span>No milestones achieved yet</span></li>';

  contentArea.innerHTML = `

  <style>
    /* Apply background to the entire content area */
    #${contentArea.id} {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .profile-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome {
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .welcome h2 {
      color: rgb(26, 115, 150);
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .welcome p {
      color: rgb(39, 106, 177);
      font-size: 1rem;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .profile-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    /* Mobile-First Collapsible Card Header */
    .card-header {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .card-icon {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .card-title-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
    }

    .card-subtitle {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 0.1rem;
    }

    .card-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .toggle-icon {
      transition: transform 0.3s ease;
      font-size: 1rem;
    }

    .profile-card.expanded .toggle-icon {
      transform: rotate(180deg);
    }
    
    .edit-btn, .add-goal-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.2s;
      margin-left: 0.5rem;
    }
    
    .edit-btn:hover, .add-goal-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .card-body {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }

    .profile-card.expanded .card-body {
      max-height: 1000px;
      padding: 1rem;
    }

    /* Always show goals form when visible */
    .goal-form {
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      margin-bottom: 1rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }

    .goal-form.show {
      max-height: 500px;
      padding: 1rem;
    }

    .goal-form.show ~ .card-body {
      padding-top: 0;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #edf2f7;
    }
    
    .detail-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .detail-label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.25rem;
    }
    
    .detail-value {
      color: #2d3748;
    }
    
    .bio .detail-value {
      line-height: 1.6;
    }
    
    .bio-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      min-height: 100px;
      font-family: inherit;
    }
    
    .milestones-list, .achievements-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .milestone-item, .achievement-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #edf2f7;
    }
    
    .milestone-item:last-child, .achievement-item:last-child {
      border-bottom: none;
    }
    
    .milestone-item > div {
      flex: 1;
    }

    .milestone-item strong {
      color: #2d3748;
      display: block;
      margin-bottom: 0.25rem;
    }

    .milestone-item div:not(:first-child) {
      color: #4a5568;
      font-size: 0.9rem;
    }

    .milestone-item small {
      color: #718096;
      font-size: 0.8rem;
    }
    
    .achievement-item i {
      color: rgb(21, 81, 133);
      font-size: 1.1rem;
    }
    
    .goal-input, .goal-desc-input, .goal-date-input, .goal-priority-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 0.75rem;
      font-family: inherit;
    }
    
    .goal-desc-input {
      min-height: 80px;
    }
    
    .submit-goal-btn {
      background: rgb(54, 126, 186);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
      width: 100%;
    }
    
    .submit-goal-btn:hover {
      background: #38a169;
    }
    
    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .goal-item {
      display: flex;
      flex-direction: column;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .goal-header-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .goal-title {
      margin: 0;
      font-size: 1rem;
      color: #2d3748;
    }
    
    .goal-priority {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: #e2e8f0;
    }
    
    .goal-priority.high {
      background: #fed7d7;
      color: #c53030;
    }
    
    .goal-priority.medium {
      background: #feebcb;
      color: #b7791f;
    }
    
    .goal-priority.low {
      background: #c6f6d5;
      color: #2f855a;
    }
    
    .goal-description {
      margin: 0 0 0.5rem 0;
      color: #4a5568;
    }
    
    .goal-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #718096;
    }
    
    .goal-date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .goal-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .delete-goal {
      background: none;
      border: none;
      color: #e53e3e;
      cursor: pointer;
      padding: 0.25rem;
    }
    
    .loading-goals, .no-goals, .error-message {
      text-align: center;
      color: #718096;
      padding: 1rem;
    }
    
    .certificates-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .certificate-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #d4af37;
    }
    
    .certificate-item-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .certificate-item i {
      font-size: 1.5rem;
      margin-right: 1rem;
      color: #d4af37;
    }
    
    .certificate-info {
      flex: 1;
    }
    
    .certificate-info h4 {
      margin: 0 0 0.25rem 0;
      color: #2d3748;
      font-size: 1rem;
    }
    
    .certificate-info p {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
    }
    
    .certificate-actions {
      margin-top: 0.75rem;
      text-align: center;
    }
    
    .view-certificate-btn {
      background: #1a5276;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      width: 100%;
    }
    
    .view-certificate-btn:hover {
      background: #154360;
    }
    
    .no-certificates {
      text-align: center;
      color: #718096;
      font-style: italic;
      padding: 1rem;
    }

    /* Desktop View */
    @media (min-width: 769px) {
      .profile-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      .card-header {
        cursor: default;
      }

      .card-toggle {
        display: none;
      }

      .card-body {
        max-height: none;
        padding: 1rem;
      }

      .goal-form {
        max-height: none;
        padding: 1rem;
      }

      .profile-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
    }
    
    /* Mobile Optimizations */
    @media (max-width: 768px) {
      .profile-container {
        padding: 0.5rem;
      }

      .profile-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .welcome h2 {
        font-size: 1.5rem;
      }

      .welcome p {
        font-size: 0.9rem;
      }

      .card-header {
        padding: 0.75rem 1rem;
      }

      .card-icon {
        font-size: 1.3rem;
      }

      .card-header h3 {
        font-size: 1rem;
      }

      .card-subtitle {
        font-size: 0.75rem;
      }

      .edit-btn, .add-goal-btn {
        padding: 0.3rem 0.6rem;
        font-size: 0.8rem;
      }

      .detail-item {
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
      }

      .goal-form.show {
        padding: 0.75rem;
      }

      .goal-input, .goal-desc-input, .goal-date-input, .goal-priority-input {
        padding: 0.6rem;
        font-size: 0.95rem;
      }

      .submit-goal-btn {
        padding: 0.6rem;
        font-size: 0.95rem;
      }

      .certificate-item {
        padding: 0.75rem;
      }

      .view-certificate-btn {
        font-size: 0.85rem;
        padding: 0.4rem 0.8rem;
      }
    }
  </style>
  
  <div class="profile-container">
    <div class="welcome">
      <h2 class="fw-bold">My Profile</h2>
      <p class="text-muted">Manage your account and track your progress.</p>
    </div>

    <div class="profile-grid">
      <!-- Card 1: Account Details -->
      <div class="profile-card" data-card="profile">
        <div class="card-header">
          <div class="card-header-content">
            <i class="fas fa-user-circle card-icon"></i>
            <div class="card-title-section">
              <h3>Profile</h3>
              <div class="card-subtitle">${currentUser.name}</div>
            </div>
          </div>
          <div class="card-toggle">
            <span>View</span>
            <i class="fas fa-chevron-down toggle-icon"></i>
          </div>
          <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        </div>
        <div class="card-body">
          <div class="detail-item"><span class="detail-label">Name:</span><span class="detail-value">${currentUser.name}</span></div>
          <div class="detail-item"><span class="detail-label">Email:</span><span class="detail-value">${currentUser.email}</span></div>
          <div class="detail-item"><span class="detail-label">Department:</span><span class="detail-value">${currentUser.department || 'N/A'}</span></div>
          <div class="detail-item"><span class="detail-label">Role:</span><span class="detail-value">${currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'N/A'}</span></div>
          <div class="detail-item bio"><span class="detail-label">Bio:</span><span class="detail-value">${currentUser.bio || 'No bio available'}</span></div>
        </div>
      </div>

      <!-- Card 2: Milestones -->
      <div class="profile-card" data-card="milestones">
        <div class="card-header">
          <div class="card-header-content">
            <i class="fas fa-trophy card-icon"></i>
            <div class="card-title-section">
              <h3>Milestones</h3>
              <div class="card-subtitle">${currentUser.milestones?.length || 0} achievements</div>
            </div>
          </div>
          <div class="card-toggle">
            <span>View</span>
            <i class="fas fa-chevron-down toggle-icon"></i>
          </div>
        </div>
        <div class="card-body">
          <ul class="milestones-list">
            ${milestones}
          </ul>
        </div>
      </div>

      <!-- Card 3: Achievements & Certificates -->
      <div class="profile-card" data-card="certificates">
        <div class="card-header">
          <div class="card-header-content">
            <i class="fas fa-certificate card-icon"></i>
            <div class="card-title-section">
              <h3>Certificates</h3>
              <div class="card-subtitle">${certificates.length} earned</div>
            </div>
          </div>
          <div class="card-toggle">
            <span>View</span>
            <i class="fas fa-chevron-down toggle-icon"></i>
          </div>
        </div>
        <div class="card-body">
          ${certificates.length > 0 ? `
            <div class="certificates-list">
              ${certificates.map(cert => `
                <div class="certificate-item">
                  <div class="certificate-item-header">
                    <i class="fas fa-certificate"></i>
                    <div class="certificate-info">
                      <h4>${cert.courseName}</h4>
                      <p>Completed on: ${new Date(cert.completionDate).toLocaleDateString()}</p>
                      <p>Grade: ${cert.grade}</p>
                    </div>
                  </div>
                  <div class="certificate-actions">
                    <button class="view-certificate-btn" data-certificate-url="${cert.certificateUrl}">
                      View Certificate
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="no-certificates">No certificates yet. Complete a course to earn certificates!</p>
          `}
        </div>
      </div>

      <!-- Card 4: Goals -->
      <div class="profile-card expanded" data-card="goals">
        <div class="card-header">
          <div class="card-header-content">
            <i class="fas fa-bullseye card-icon"></i>
            <div class="card-title-section">
              <h3>Goals</h3>
              <div class="card-subtitle">Personal targets</div>
            </div>
          </div>
          <div class="card-toggle">
            <span>Hide</span>
            <i class="fas fa-chevron-down toggle-icon"></i>
          </div>
          <button class="add-goal-btn"><i class="fas fa-plus"></i> Add</button>
        </div>
        <div class="goal-form">
          <input type="text" class="goal-input" placeholder="Goal Title" />
          <textarea class="goal-desc-input" placeholder="Goal Description"></textarea>
          <input type="date" class="goal-date-input" placeholder="Target Date" 
                min="${new Date().toISOString().split('T')[0]}" />
          <select class="goal-priority-input">
            <option value="low">Low Priority</option>
            <option value="medium" selected>Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button class="submit-goal-btn">Set Goal</button>
        </div>
        <div class="card-body">
          <div class="goals-list"><div class="loading-goals">Loading goals...</div></div>
        </div>
      </div>
    </div>
  </div>
  `;

  // Setup collapsible functionality for mobile
  setupCollapsibleCards(contentArea);

  // Event listeners for certificate buttons
  contentArea.querySelectorAll('.view-certificate-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const certificateUrl = e.target.dataset.certificateUrl;
      window.open(`http://localhost:5000${certificateUrl}`, '_blank');
    });
  });
  
  // Bio edit button
  const editBtn = contentArea.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.onclick = () => startEditingProfile(contentArea, currentUser);
  }

  // Setup goals functionality
  setupGoalsFunctionality(currentUser, contentArea);
}

// Setup collapsible cards for mobile view
function setupCollapsibleCards(contentArea) {
  const isMobile = () => window.innerWidth <= 768;
  
  contentArea.querySelectorAll('.profile-card').forEach(card => {
    const header = card.querySelector('.card-header');
    const toggleSpan = card.querySelector('.card-toggle span');
    
    // Only make headers clickable on mobile
    const handleHeaderClick = (e) => {
      // Don't toggle if clicking on edit/add buttons
      if (e.target.closest('.edit-btn, .add-goal-btn')) return;
      
      if (isMobile()) {
        card.classList.toggle('expanded');
        const isExpanded = card.classList.contains('expanded');
        toggleSpan.textContent = isExpanded ? 'Hide' : 'View';
      }
    };
    
    header.addEventListener('click', handleHeaderClick);
    
    // Handle resize events
    const handleResize = () => {
      if (!isMobile()) {
        card.classList.add('expanded');
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial state
    if (!isMobile()) {
      card.classList.add('expanded');
    }
  });
}

// Editable Bio
async function startEditingProfile(contentArea, currentUser) {
  const bioEl = contentArea.querySelector('.detail-item.bio .detail-value');
  if (!bioEl) return;

  const textarea = document.createElement('textarea');
  textarea.value = currentUser.bio || '';
  textarea.classList.add('bio-input');
  bioEl.innerHTML = '';
  bioEl.appendChild(textarea);

  const editBtn = contentArea.querySelector('.edit-btn');
  editBtn.innerHTML = '<i class="fas fa-save"></i> Save';
  editBtn.onclick = async () => {
    const newBio = textarea.value.trim();
    try {
      const res = await fetch(`${API_BASE_URL}/Profile/edit/${currentUser.email}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: newBio })
      });

      if (!res.ok) throw new Error('Failed to update bio');
      const updatedProfile = await res.json();

      currentUser.bio = updatedProfile.bio;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      bioEl.textContent = updatedProfile.bio || 'No bio available';
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
      editBtn.onclick = () => startEditingProfile(contentArea, currentUser);
    } catch (err) {
      console.error(err);
      alert('Failed to save bio. Please try again.');
    }
  };
}

// Goals functionality
function setupGoalsFunctionality(currentUser, contentArea) {
  const addGoalBtn = contentArea.querySelector(".add-goal-btn");
  const goalForm = contentArea.querySelector(".goal-form");
  const submitGoalBtn = contentArea.querySelector(".submit-goal-btn");
  const goalsList = contentArea.querySelector(".goals-list");

  // Set minimum date to today (this makes past dates grey/unselectable)
  const dateInput = contentArea.querySelector(".goal-date-input");
  dateInput.min = new Date().toISOString().split('T')[0];

  // Toggle form visibility
  addGoalBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent card toggle
    goalForm.classList.toggle("show");
    const isShowing = goalForm.classList.contains("show");
    addGoalBtn.innerHTML = isShowing 
      ? '<i class="fas fa-times"></i> Cancel'
      : '<i class="fas fa-plus"></i> Add';
  });

  // Submit goal
  submitGoalBtn.addEventListener("click", async () => {
    const titleInput = contentArea.querySelector(".goal-input");
    const descInput = contentArea.querySelector(".goal-desc-input");
    const dateInput = contentArea.querySelector(".goal-date-input");
    const priorityInput = contentArea.querySelector(".goal-priority-input");

    if (titleInput.value.trim()) {
      try {
        await fetch(`${API_BASE_URL}/profile/${currentUser.email}/goals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
            targetDate: dateInput.value,
            priority: priorityInput.value
          })
        });

        await fetchGoals(currentUser.email, goalsList);

        // Reset form
        titleInput.value = "";
        descInput.value = "";
        dateInput.value = "";
        priorityInput.value = "medium";
        goalForm.classList.remove("show");
        addGoalBtn.innerHTML = '<i class="fas fa-plus"></i> Add';

      } catch (error) {
        console.error("Error saving goal:", error);
        alert("Failed to save goal. Please try again.");
      }
    } else {
      alert("Goal title is required.");
    }
  });

  // Fetch goals
  async function fetchGoals(email, container) {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${email}`);
      const profile = await res.json();
      container.innerHTML = "";

      if (profile.goals && profile.goals.length > 0) {
        profile.goals.forEach((goal, goalIndex) => {
          const goalItem = document.createElement("div");
          goalItem.classList.add("goal-item");
          
          const formattedDate = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : null;
          
          goalItem.innerHTML = `
            <div class="goal-header-wrapper">
              <h4 class="goal-title">${goal.title}</h4>
              <span class="goal-priority ${goal.priority && goal.priority.toLowerCase()}">${goal.priority ? goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1) : 'Medium'} Priority</span>
              <div class="goal-actions">
                <button class="delete-goal" data-index="${goalIndex}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
            
            <div class="goal-meta">
              <div class="goal-date">
                <i class="fas fa-calendar-alt"></i>
                ${formattedDate ? `Target date: ${formattedDate}` : "No target date set"}
              </div>
            </div>
          `;
          container.appendChild(goalItem);
        });

        //delete events
        container.querySelectorAll(".delete-goal").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            // Get the button element (not the icon)
            const button = e.currentTarget; // This always refers to the element the listener was attached to
            const goalIndex = parseInt(button.getAttribute("data-index"));
            
            try {
              await fetch(`${API_BASE_URL}/profile/${currentUser.email}/goals/${goalIndex}`, {
                method: "DELETE"
              });
              await fetchGoals(currentUser.email, goalsList);
            } catch (error) {
              console.error("Error deleting goal:", error);
              alert("Failed to delete goal.");
            }
          });
        });

      } else {
        container.innerHTML = "<p>No goals set yet.</p>";
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  }

  // Initial load
  fetchGoals(currentUser.email, goalsList);
}