import { userData } from '../Data/data.js';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export async function renderProfileTab(contentArea, currentUser) {
  // Fetch latest profile from backend to get bio and milestones
  try {
    const res = await fetch(`${API_BASE_URL}/Profile/${currentUser.email}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    const profile = await res.json();
    currentUser.bio = profile.bio || '';
    currentUser.milestones = profile.milestones || [];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } catch (err) {
    console.error('Error fetching profile:', err);
    currentUser.bio = currentUser.bio || '';
    currentUser.milestones = currentUser.milestones || [];
  }

  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
  };

  // Generate milestones list 
  const milestones = currentUser.milestones.length > 0 
    ? currentUser.milestones.map(m => m.title + (m.description ? ` - ${m.description}` : ''))
    : ["The system will render your milestones when you achieve them"];

  const achievements = ["The system will render your achievements when you achieve them"];

  contentArea.innerHTML = `

  <style>
      .profile-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
       background: linear-gradient(135deg,rgb(125, 152, 173) 0%, #3182ce 100%);
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
      
      .profile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }
      
      .profile-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .profile-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        background: linear-gradient(135deg,rgb(125, 152, 173) 0%, #3182ce 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color:white;
      }
      
      .edit-btn, .add-goal-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background 0.2s;
      }
      
      .edit-btn:hover, .add-goal-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .card-body {
        padding: 1.5rem;
      }
      
      .detail-item {
        display: flex;
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
        min-width: 100px;
      }
      
      .detail-value {
        color: #2d3748;
        flex: 1;
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
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #edf2f7;
      }
      
      .milestone-item:last-child, .achievement-item:last-child {
        border-bottom: none;
      }
      
      .milestone-item i {
        color:rgb(21, 81, 133);
        font-size: 1.1rem;
      }
      
      .achievement-item i {
        color: rgb(21, 81, 133);
        font-size: 1.1rem;
      }
      
      .goal-form {
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      
      .goal-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        font-family: inherit;
      }
      
      .submit-goal-btn {
        background:rgb(54, 126, 186);
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
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
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f7fafc;
        border-radius: 8px;
        transition: all 0.2s;
      }
      
      .goal-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
      }
      
      .goal-checkbox {
        width: 1.1rem;
        height: 1.1rem;
        cursor: pointer;
      }
      
      .goal-text {
        color: #2d3748;
      }
      
      .delete-goal {
        background: none;
        border: none;
        color: #e53e3e;
        cursor: pointer;
        padding: 0.5rem;
      }
      
      .loading-goals, .no-goals, .error-message {
        text-align: center;
        color: #718096;
        padding: 1rem;
      }
      
      @media (max-width: 768px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
        
        .detail-item {
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .detail-label {
          min-width: auto;
        }
      }
    </style>
    
    <div class="welcome">
      <h2 class="fw-bold">My Profile</h2>
      <p class="text-muted">Manage your account and track your progress.</p>
    </div>

    <div class="profile-grid">
      <!-- Card 1: Account Details -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Account Details</h3>
          <button class="edit-btn"><i class="fas fa-plus"></i> Edit</button>
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
      <div class="profile-card">
        <div class="card-header"><h3>Milestones</h3></div>
        <div class="card-body">
          <ul class="milestones-list">
            ${milestones.map(m => `<li class="milestone-item"><i class="fas fa-check-circle"></i><span>${m}</span></li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Card 3: Achievements -->
      <div class="profile-card">
        <div class="card-header"><h3>Achievements & Certificates</h3></div>
        <div class="card-body">
          <ul class="achievements-list">
            ${achievements.map(a => `<li class="achievement-item"><i class="fas fa-trophy"></i><span>${a}</span></li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Card 4: Goals -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Goals</h3>
          <button class="add-goal-btn"><i class="fas fa-plus"></i> Add Goal</button>
        </div>
       <div class="goal-form" style="display:none;">
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
  `;

  // Bio edit button
  const editBtn = contentArea.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.onclick = () => startEditingProfile(contentArea, currentUser);
  }

  // Setup goals functionality
  setupGoalsFunctionality(currentUser, contentArea);
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
  editBtn.textContent = 'Save';
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
      editBtn.textContent = 'Edit';
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
  addGoalBtn.addEventListener("click", () => {
    goalForm.style.display = goalForm.style.display === "none" ? "block" : "none";
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
        goalForm.style.display = "none";

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