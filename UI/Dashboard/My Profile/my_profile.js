import { userData } from '../Data/data.js';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export async function renderProfileTab(contentArea, currentUser) {
  // Fetch latest profile from backend to get bio
  try {
    const res = await fetch(`${API_BASE_URL}/Profile/${currentUser.email}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    const profile = await res.json();
    currentUser.bio = profile.bio || '';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } catch (err) {
    console.error('Error fetching profile:', err);
    currentUser.bio = currentUser.bio || '';
  }

  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
  };

  // Sample milestones & achievements
  const milestones = [
    "Completed 5 courses",
    "Reached 50% overall progress",
    "Active for 30 consecutive days"
  ];
  const achievements = [
    "Python Fundamentals Certificate",
    "Top Learner Award",
    "Course Contributor Badge"
  ];

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
    
    <div class="profile-container">
      <div class="welcome">
        <h2>My Profile</h2>
        <p>Manage your account and track your progress</p>
      </div>

      <div class="profile-grid">
        <!-- Card 1: Account Details -->
        <div class="profile-card account-card">
          <div class="card-header">
            <h3>Account Details</h3>
            <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
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
        <div class="profile-card milestones-card">
          <div class="card-header">
            <h3>Milestones</h3>
          </div>
          <div class="card-body">
            <ul class="milestones-list">
              ${milestones.map(m => `
                <li class="milestone-item">
                  <i class="fas fa-check-circle"></i>
                  <span>${m}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Card 3: Achievements -->
        <div class="profile-card achievements-card">
          <div class="card-header">
            <h3>Achievements</h3>
          </div>
          <div class="card-body">
            <ul class="achievements-list">
              ${achievements.map(a => `
                <li class="achievement-item">
                  <i class="fas fa-trophy"></i>
                  <span>${a}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Card 4: Goals -->
        <div class="profile-card goals-card">
          <div class="card-header">
            <h3>Learning Goals</h3>
            <button class="add-goal-btn"><i class="fas fa-plus"></i> Add Goal</button>
          </div>
          <div class="goal-form" style="display:none;">
            <input type="text" class="goal-input" placeholder="Enter your learning goal">
            <button class="submit-goal-btn">Set Goal</button>
          </div>
          <div class="card-body">
            <div class="goals-list"><div class="loading-goals">Loading goals...</div></div>
          </div>
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

// Goals functions
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
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete goal');
}

async function updateGoalStatus(goalId, completed) {
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!response.ok) throw new Error('Failed to update goal status');
}