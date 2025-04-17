export function renderProfileTab(contentArea) {
    const userProgress = userData[currentUser.email];
    contentArea.innerHTML = `
      <div class="welcome">
        <h2 class="fw-bold">My Profile</h2>
        <p class="text-muted">Manage your account and track your progress.</p>
      </div>
      <div class="profile-section">
        <h3>Account Details</h3>
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Department:</strong> ${currentUser.department}</p>
        <p><strong>Internship Start Date:</strong> ${currentUser.startDate}</p>
        <p><strong>Role:</strong> ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
        <p><strong>Bio:</strong> ${currentUser.bio}</p>
        <h3>Learning Stats</h3>
        <p><strong>Courses Enrolled:</strong> ${userProgress.enrolledCourses.length}</p>
        <p><strong>Courses Completed:</strong> ${userProgress.completedCourses.length}</p>
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
      renderProfileTab(document.getElementById("contentArea"));
    }
  }