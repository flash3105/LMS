import { userData } from '../Data/data.js';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export function renderProfileTab(contentArea, currentUser) {
  // Restore from localStorage if available
  const savedUser = JSON.parse(localStorage.getItem('currentUser'));
  if (savedUser && savedUser.email === currentUser.email) {
    currentUser = savedUser;
  }

  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
  };

  // Sample milestones & achievements
  const milestones = [
    "The system will render your milestones when you achieve them"
  ];
  const achievements = [
    "The system will render your achievements when you achieve them"
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
          <h3>Set Your Goals</h3>
          <button class="add-goal-btn"><i class="fas fa-plus"></i> Add Goal</button>
        </div>
        <div class="goal-form" style="display:none;">
          <input type="text" class="goal-input" placeholder="Enter your goal">
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

  // Goals
  setupGoalsFunctionality(currentUser);
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
      localStorage.setItem('currentUser', JSON.stringify(currentUser)); // persist

      bioEl.textContent = updatedProfile.bio || 'No bio available';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => startEditingProfile(contentArea, currentUser);
    } catch (err) {
      console.error(err);
      alert('Failed to save bio. Please try again.');
    }
  };
}

// Goals functions (unchanged from your original)
async function setupGoalsFunctionality(currentUser) {
  const addGoalBtn = document.querySelector('.add-goal-btn');
  const goalForm = document.querySelector('.goal-form');
  const submitGoalBtn = document.querySelector('.submit-goal-btn');
  const goalsList = document.querySelector('.goals-list');

  await fetchGoals(currentUser.email, goalsList);

  if (addGoalBtn && goalForm && submitGoalBtn && goalsList) {
    addGoalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
    });

    submitGoalBtn.addEventListener('click', async () => {
      const goalInput = document.querySelector('.goal-input');
      if (goalInput.value.trim()) {
        try {
          await saveGoalToDatabase(currentUser.email, { title: goalInput.value.trim() });
          await fetchGoals(currentUser.email, goalsList);
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
    const response = await fetch(`${API_BASE_URL}/Profile/${userEmail}`);
    if (!response.ok) throw new Error('Failed to fetch goals');

    const goals = await response.json();
    goalsList.innerHTML = '';

    if (goals.length === 0) {
      goalsList.innerHTML = '<p class="no-goals">No goals set yet. Add your first goal!</p>';
      return;
    }

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
          e.target.checked = !e.target.checked;
        }
      });
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    goalsList.innerHTML = '<p class="error-message">Failed to load goals. Please try again later.</p>';
  }
}

async function saveGoalToDatabase(email, goal) {
  const payload = {
    title: goal.title,
    description: goal.description || '',
    targetDate: goal.targetDate || ''
  };
  const res = await fetch(`${API_BASE_URL}/Profile/${email}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add goal');
  return await res.json();
}

async function deleteGoalFromDatabase(goalId) {
  const response = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete goal');
}

async function updateGoalStatus(goalId, completed) {
  const response = await fetch(`/api/goals/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!response.ok) throw new Error('Failed to update goal status');
}
