import { userData } from '../Data/data.js';
import { fetchUserProfile, addGoal } from '../Profile/profileApi.js';

export function renderProfileTab(contentArea, currentUser) {
  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
  };

  // Sample milestones data - you can replace with real data
  const milestones = [
    "Passed Physics 1",
    "Completed 5 courses",
    "Reached 100 study hours",
    "Earned Bronze Badge"
  ];

  // Sample achievements data
  const achievements = [
    "Certificate of Completion: Physics Fundamentals",
    "Advanced Mathematics Certification",
    "Top Performer Award",
    "Perfect Attendance"
  ];

  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">My Profile</h2>
      <p class="text-muted">Manage your account and track your progress.</p>
    </div>
    
    <div class="profile-grid">
      <!-- Card 1: Account Details -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Account Details</h3>
          <button class="edit-btn" onclick="editProfile()">
            <i class="fas fa-edit"></i> Edit
          </button>
        </div>
        <div class="card-body">
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${currentUser.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${currentUser.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Department:</span>
            <span class="detail-value">${currentUser.department || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Internship Start:</span>
            <span class="detail-value">${currentUser.startDate || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Role:</span>
            <span class="detail-value">${currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'N/A'}</span>
          </div>
          <div class="detail-item bio">
            <span class="detail-label">Bio:</span>
            <span class="detail-value">${currentUser.bio || 'No bio available'}</span>
          </div>
        </div>
      </div>
      
      <!-- Card 2: Milestones -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Milestones</h3>
        </div>
        <div class="card-body">
          <ul class="milestones-list">
            ${milestones.map(milestone => `
              <li class="milestone-item">
                <i class="fas fa-check-circle"></i>
                <span>${milestone}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <!-- Card 3: Achievements & Certificates -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Achievements & Certificates</h3>
        </div>
        <div class="card-body">
          <ul class="achievements-list">
            ${achievements.map(achievement => `
              <li class="achievement-item">
                <i class="fas fa-trophy"></i>
                <span>${achievement}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <!-- Card 4: Set Your Goals -->
      <div class="profile-card">
        <div class="card-header">
          <h3>Set Your Goals</h3>
          <button class="add-goal-btn">
            <i class="fas fa-plus"></i> Add Goal
          </button>
        </div>
        <div class="goal-form" style="display:none;">
          <input type="text" class="goal-input" placeholder="Enter your goal">
          <button class="submit-goal-btn">Set Goal</button>
        </div>
        <div class="card-body">
          <div class="goals-list">
            <!-- Goals will appear here dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize goals functionality
  setupGoalsFunctionality();
}

function setupGoalsFunctionality() {
  const addGoalBtn = document.querySelector('.add-goal-btn');
  const goalForm = document.querySelector('.goal-form');
  const submitGoalBtn = document.querySelector('.submit-goal-btn');
  const goalsList = document.querySelector('.goals-list');

  if (addGoalBtn && goalForm && submitGoalBtn && goalsList) {
    // Toggle form visibility
    addGoalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
    });

    // Handle goal submission
    submitGoalBtn.addEventListener('click', () => {
      const goalInput = document.querySelector('.goal-input');
      if (goalInput.value.trim()) {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        
        goalItem.innerHTML = `
          <div class="goal-content">
            <input type="checkbox" class="goal-checkbox">
            <span class="goal-text">${goalInput.value.trim()}</span>
          </div>
          <button class="delete-goal"><i class="fas fa-trash"></i></button>
        `;

        goalsList.appendChild(goalItem);
        
        // Clear form
        goalInput.value = '';
        goalForm.style.display = 'none';

        // Add event listeners
        goalItem.querySelector('.delete-goal').addEventListener('click', () => {
          goalItem.remove();
        });

        const checkbox = goalItem.querySelector('.goal-checkbox');
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            goalItem.style.opacity = '0.6';
            goalItem.querySelector('.goal-text').style.textDecoration = 'line-through';
          } else {
            goalItem.style.opacity = '1';
            goalItem.querySelector('.goal-text').style.textDecoration = 'none';
          }
        });
      }
    });
  }
}

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
    renderProfileTab(document.getElementById("contentArea"), currentUser);
  }
}

// Example: Load and display profile data
async function loadProfile(userId) {
  try {
    const profile = await fetchUserProfile(userId);
    // Render achievements, milestones, and goals in your UI
    renderAchievements(profile.achievements);
    renderMilestones(profile.milestones);
    renderGoals(profile.goals);
  } catch (err) {
    console.error('Failed to load profile:', err);
    // Show error message in UI if needed
  }
}

// Example: Add a new goal from a form
async function handleAddGoal(userId, goalData) {
  try {
    const updatedProfile = await addGoal(userId, goalData);
    // Optionally re-render goals or the whole profile
    renderGoals(updatedProfile.goals);
  } catch (err) {
    console.error('Failed to add goal:', err);
    // Show error message in UI if needed
  }
}

// Example render functions (implement as needed)
function renderAchievements(achievements) {
  // Render achievements in the DOM
}
function renderMilestones(milestones) {
  // Render milestones in the DOM
}
function renderGoals(goals) {
  // Render goals in the DOM
}