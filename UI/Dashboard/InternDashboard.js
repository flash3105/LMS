import { renderSidebar } from './Components/Sidebar.js';
import { renderHomeTab } from './Home/home.js';
import { renderProfileTab } from './My Profile/my_profile.js';
import { renderLearningTab } from './Learning/learning.js';
import { renderCourseDetails } from './Courses/Courses.js';
import { renderAssessmentsTab } from './Components/Assessment.js';
import { renderMessagesTab } from './Messages/messages.js';
import{ renderCalendarTab } from './Calendar/calendar.js';
import { renderAssessmentPage } from './AssessmentPage.js';
import { renderAssistTab } from './Assist/assist.js';
let currentUser = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "user@example.com" };
function getInitials(name) {
  if (!name) return "US";
  const names = name.split(" ");
  return (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase();
}
let currentTab = "home";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (sidebarContainer) sidebarContainer.innerHTML = renderSidebar();

  const userNameEl = document.getElementById("userName");
  const initialsEl = document.getElementById("userInitials"); // Added this
  
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (initialsEl) initialsEl.textContent = getInitials(currentUser.name); 

  renderContent("home");
  setupSidebarNavigation();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("keyup", searchGlobal);
});

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
      renderLearningTab(contentArea,currentUser);
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
}

function setupSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar a");
  if (!links) return;

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove "active" class from all links
      links.forEach(l => l.classList.remove("active"));

      // Add "active" class to the clicked link
      link.classList.add("active");

      // Extract the tab name from the link's id
      const tab = link.getAttribute("id")?.replace("Link", "").toLowerCase();
      if (tab) {
        renderContent(tab); // Call renderContent with the correct tab
      } else {
        console.error("Invalid tab id:", link.getAttribute("id"));
      }
    });
  });

  // Sign out functionality
  const signOut = document.getElementById("signOutLink");
  if (signOut) {
    signOut.addEventListener("click", () => {
      try {
        localStorage.clear();
        window.location.href = "/";
      } catch (err) {
        console.error("Error signing out:", err);
      }
    });
  }
}

function searchGlobal() {
  const query = document.getElementById("searchInput")?.value.toLowerCase();
  if (!query) return;
  if (currentTab === "learning") {
    renderLearningTab(document.getElementById("contentArea"), query);
  } else {
    alert(`Searching for: ${query}`);
  }
}
