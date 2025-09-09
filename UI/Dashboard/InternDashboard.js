import { renderSidebar } from './Components/Sidebar.js';
import { renderHomeTab } from './Home/home.js';
import { renderProfileTab } from './My Profile/my_profile.js';
import { renderLearningTab } from './Learning/learning.js';
import { renderCourseDetails } from './Courses/Courses.js';
import { renderAssessmentsTab } from './Components/Assessment.js';
import { renderMessagesTab } from './Messages/messages.js';
import { renderCalendarTab } from './Calendar/calendar.js';
import { renderAssessmentPage } from './AssessmentPage.js';
import { renderAssistTab } from './Assist/assist.js';

let currentUser = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "user@example.com" };
let currentTab = "home";

function getInitials(name) {
  if (!name) return "US";
  const names = name.split(" ");
  return (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase();
}

// -------------------- Render Sidebar --------------------
function initializeSidebar() {
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (!sidebarContainer) return;

  // Inject sidebar HTML
  sidebarContainer.innerHTML = renderSidebar();

  // Setup navigation (delegation)
  setupSidebarNavigation();

  // Setup responsive features (hamburger, overlay)
  setupResponsiveFeatures();
}

// -------------------- Render Content --------------------
function renderContent(tab) {
  currentTab = tab;
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  switch (tab) {
    case "home":
      renderHomeTab(contentArea, currentUser);
      break;
    case "profile":
      renderProfileTab(contentArea, currentUser);
      break;
    case "learning":
      renderLearningTab(contentArea, currentUser);
      break;
    case "assessments":
      renderAssessmentPage(contentArea);
      break;
    case "messages":
      renderMessagesTab(contentArea);
      break;
    case "calendar":
      renderCalendarTab(contentArea);
      break;
    case "assist":
      renderAssistTab(contentArea);
      break;
    default:
      console.error(`Unknown tab: ${tab}`);
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

// -------------------- Sidebar Navigation --------------------
function setupSidebarNavigation() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  // Event delegation for all links
  sidebar.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault();

    // Remove active from all links
    sidebar.querySelectorAll("a").forEach(l => l.classList.remove("active"));
    // Add active to clicked link
    link.classList.add("active");

    // Extract tab from id
    const tab = link.getAttribute("id")?.replace("Link", "").toLowerCase();
    if (tab) {
      renderContent(tab);
    } else {
      console.error("Invalid tab id:", link.getAttribute("id"));
    }
  });

  // Sign out
  const signOut = document.getElementById("signOutLink");
  if (signOut) {
    signOut.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "/";
    });
  }
}

// -------------------- Responsive Sidebar --------------------
let overlay;
function setupResponsiveFeatures() {
  const toggleSidebar = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar || !toggleSidebar) return;

  // Create overlay if not exists
  overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function toggleSidebarFunc() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  }

  // Expose globally
  window.closeSidebar = closeSidebar;

  // Hamburger click/touch
  ["click", "touchstart"].forEach(evt => {
    toggleSidebar.addEventListener(evt, function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebarFunc();
    });
  });

  // Overlay click closes sidebar
  overlay.addEventListener('click', closeSidebar);

  // Click outside closes sidebar on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        e.target !== toggleSidebar) {
      closeSidebar();
    }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

// -------------------- Initialize --------------------
document.addEventListener("DOMContentLoaded", () => {
  // Set user info
  const userNameEl = document.getElementById("userName");
  const initialsEl = document.getElementById("userInitials");
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (initialsEl) initialsEl.textContent = getInitials(currentUser.name);

  // Initialize sidebar + navigation
  initializeSidebar();

  // Load home tab initially
  renderContent("home");
});
