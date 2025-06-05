function renderProfileSection(user) {
  return `
    <div class="profile-section">
      <h3>Account Details</h3>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
      <p><strong>Internship Start Date:</strong> ${user.startDate || 'N/A'}</p>
      <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      <p><strong>Bio:</strong> ${user.bio || 'No bio available'}</p>
      <h3>Settings</h3>
      <div class="settings-item" onclick="editProfile()">
        <p>Edit Profile</p>
      </div>
      <div class="settings-item" onclick="changePassword()">
        <p>Change Password</p>
      </div>
    </div>
  `;
}