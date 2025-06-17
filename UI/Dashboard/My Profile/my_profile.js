import { userData } from '../Data/data.js';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

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
            <!-- Goals will be loaded here from database -->
            <div class="loading-goals">Loading goals...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize goals functionality
  setupGoalsFunctionality(currentUser);
}

async function setupGoalsFunctionality(currentUser) {
  const addGoalBtn = document.querySelector('.add-goal-btn');
  const goalForm = document.querySelector('.goal-form');
  const submitGoalBtn = document.querySelector('.submit-goal-btn');
  const goalsList = document.querySelector('.goals-list');

  // First load existing goals from database
  await fetchGoals(currentUser.email, goalsList);

  if (addGoalBtn && goalForm && submitGoalBtn && goalsList) {
    // Toggle form visibility
    addGoalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
    });

    // Handle goal submission
    submitGoalBtn.addEventListener('click', async () => {
      const goalInput = document.querySelector('.goal-input');
      if (goalInput.value.trim()) {
        try {
          await saveGoalToDatabase(currentUser.email, goalInput.value.trim());
          // Reload goals after adding new one
          await fetchGoals(currentUser.email, goalsList);
          
          // Clear form
          goalInput.value = '';
          goalForm.style.display = 'none';
        } catch (error) {
          console.error('Error saving goal:', error);
          alert('Failed to save goal. Please try again.');
        }
      }
    });
  }
}

async function fetchGoals(userEmail, goalsList) {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`${API_BASE_URL}/Profile/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }
    
    const goals = await response.json();
    
    // Clear loading message
    goalsList.innerHTML = '';
    
    if (goals.length === 0) {
      goalsList.innerHTML = '<p class="no-goals">No goals set yet. Add your first goal!</p>';
      return;
    }
    
    // Render each goal
    goals.forEach(goal => {
      const goalItem = document.createElement('div');
      goalItem.className = 'goal-item';
      goalItem.dataset.goalId = goal.id;
      
      goalItem.innerHTML = `
        <div class="goal-content">
          <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
          <span class="goal-text">${goal.text}</span>
        </div>
        <button class="delete-goal"><i class="fas fa-trash"></i></button>
      `;

      goalsList.appendChild(goalItem);
      
      // Add event listeners
      goalItem.querySelector('.delete-goal').addEventListener('click', async () => {
        try {
          await deleteGoalFromDatabase(goal.id);
          goalItem.remove();
        } catch (error) {
          console.error('Error deleting goal:', error);
          alert('Failed to delete goal. Please try again.');
        }
      });

      const checkbox = goalItem.querySelector('.goal-checkbox');
      checkbox.addEventListener('change', async (e) => {
        try {
          await updateGoalStatus(goal.id, e.target.checked);
          if (e.target.checked) {
            goalItem.style.opacity = '0.6';
            goalItem.querySelector('.goal-text').style.textDecoration = 'line-through';
          } else {
            goalItem.style.opacity = '1';
            goalItem.querySelector('.goal-text').style.textDecoration = 'none';
          }
        } catch (error) {
          console.error('Error updating goal status:', error);
          // Revert the checkbox if update fails
          e.target.checked = !e.target.checked;
        }
      });
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    goalsList.innerHTML = '<p class="error-message">Failed to load goals. Please try again later.</p>';
  }
}

  
  async function saveGoalToDatabase(userId, goal) {
 const res= await fetch(`${API_BASE_URL}/Profile/${encodeURIComponent(userId)}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Failed to add goal');
  return await res.json();
}

async function deleteGoalFromDatabase(goalId) {
  // Replace with your actual API endpoint
  const response = await fetch(`/api/goals/${goalId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete goal');
  }
}

async function updateGoalStatus(goalId, completed) {
  // Replace with your actual API endpoint
  const response = await fetch(`/api/goals/${goalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completed: completed
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update goal status');
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