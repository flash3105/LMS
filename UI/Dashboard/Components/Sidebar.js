// Global variable for current user

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function signOut() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  window.location.href = "/UI/Login/Login.html"; // Adjust path as needed
}

export function renderSidebar() {
  return `
    <div class="sidebar">
      <div class="sidebar-header">
        <a class="navbar-brand" href="#">
          <span style="display: flex; align-items: center;">
            <i class="fas fa-graduation-cap" style="font-size: 2rem; color: #1e88e5; margin-right: 0.5rem;"></i>
            <span style="font-size: 1.5rem; font-weight: bold; letter-spacing: 2px; color: white;">THUTO</span>
          </span>
        </a>
      </div>
      <div class="sidebar-menu">
        <a href="#" id="homeLink" class="active">
          <i class="fas fa-home me-2"></i>Home
        </a>
        <a href="#" id="profileLink">
          <i class="fas fa-user me-2"></i>My Profile
        </a>
        <a href="#" id="learningLink">
          <i class="fas fa-book-reader me-2"></i>Learning
        </a>
        <a href="#" id="assessmentsLink">
          <i class="fas fa-book me-2"></i>Assessments
        </a>
        <a href="#" id="calendarLink">
          <i class="fas fa-calendar-alt me-2"></i>Calendar
        </a>
        <a href="#" id="messagesLink">
          <i class="fas fa-envelope me-2"></i>Messages
        </a>
        <a href="#" id="assistLink">
          <i class="fas fa-life-ring me-2"></i>Assist
        </a>
        <div class="sidebar-footer">
          <a href="#" id="signOutLink" onclick="signOut()">
            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
          </a>
        </div>
      </div>
    </div>
  `;
}

// Make signOut available globally for the onclick handler
window.signOut = signOut;