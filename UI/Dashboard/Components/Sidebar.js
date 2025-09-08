// Global variable for current user

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function signOut() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  window.location.href = "/UI/Login/Login.html"; // Adjust path as needed
}

export function renderSidebar() {
  return `
  <div class="sidebar" 
     style="width:260px; height:100vh;
            color:white; display:flex; flex-direction:column; box-shadow:4px 0 12px rgba(0,0,0,0.2);background-color:#2c3e50 ;
            position:fixed; top:0; left:0; transition:all 0.3s ease;">

  <div class="sidebar-header" 
       style="padding:1.5rem; border-bottom:1px solid rgba(255,255,255,0.2);">
    <a class="navbar-brand" href="#" style="text-decoration:none;">
      <span style="display:flex; align-items:center; gap:0.8rem;">
        <img src="../images/logoN.jpg" 
             alt="logo" 
             style="width:45px; height:45px; border-radius:50%; object-fit:cover;
                    box-shadow:0px 2px 6px rgba(0,0,0,0.4);">
        <span style="font-size:1.6rem; font-weight:700; letter-spacing:1px; 
                     color:#fff; text-transform:uppercase;">iNurture</span>
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