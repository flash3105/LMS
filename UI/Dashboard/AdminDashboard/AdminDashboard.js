// Ensure the script is treated as a module
import { renderSidebar } from '../Components/Sidebar.js';
import { renderHomeTab } from './AdminHome.js';
import { renderadminLearning } from './AdminLearning.js';
import { renderProfileTab } from '../My Profile/my_profile.js';
import { renderSetAssessment } from '../Assessments/assessments.js';
import { renderMessagesTab } from '../Messages/messages.js';
import { renderCalendarTab } from '../Calendar/calendar.js';
import { renderAssistTab } from '../Assist/assist.js';

let currentUser = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "user@example.com" };
let currentTab = "home";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (sidebarContainer) sidebarContainer.innerHTML = renderSidebar();

  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.textContent = currentUser.name;
   const userInitialsEl = document.querySelector(".user-initials");
  if (userInitialsEl && currentUser.name) {
    // Get initials from the name
    const initials = currentUser.name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
    userInitialsEl.textContent = initials;
  }

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
     renderadminLearning(contentArea, ""); // Now correctly references renamed function
      break;
    case "assessments":
      renderSetAssessment(contentArea);
      break;
   case "messages":
      renderMessagesTab(contentArea);
      break;

  case "assist":
      renderAssistTab(contentArea);
      break;
  case "calendar":
      renderCalendarTab(contentArea);
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

      // Remove "active" class from all links and add to the clicked link
      links.forEach(l => l.classList.remove("active"));
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
        window.location.href = "/UI";
      } catch (err) {
        console.error("Error signing out:", err);
      }
    });
  }
}

function searchGlobal() {
  const query = document.getElementById("searchInput")?.value.toLowerCase();
  if (!query) return;

  const contentArea = document.getElementById("contentArea");
  if (currentTab === "learning") {
    renderAdminLearning(contentArea, query); // Now properly filters content
  } else {
    alert(`Searching for: ${query}`);
  }
}
