const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Fetch the user's profile (achievements, milestones, goals)
export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE_URL}/profile/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return await res.json();
}

// Add a new goal (only goals can be added from the UI)
export async function addGoal(userId, goal) {
  const res = await fetch(`${API_BASE_URL}/profile/${userId}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Failed to add goal');
  return await res.json();
}