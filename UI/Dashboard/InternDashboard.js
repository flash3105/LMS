import { renderSidebar } from './Components/Sidebar.js';
import { renderHomeTab } from './Home/home.js';
import { renderProfileTab } from './My Profile/my_profile.js';
import { renderLearningTab } from './Learning/learning.js';
import { renderCourseDetails } from './Courses/Courses.js';
import { renderAssessmentsTab } from './Components/Assessment.js';
import { renderMessagesTab } from './Messages/messages.js';

let currentUser = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "user@example.com" };
let currentTab = "home";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (sidebarContainer) sidebarContainer.innerHTML = renderSidebar();

  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.textContent = currentUser.name;

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
      renderLearningTab(contentArea);
      break;
    case "courses":
      renderCourseDetails(contentArea); // fixed function name
      break;
    case "assessments":
      renderAssessmentsTab(contentArea);
      break;
    case "messages":
      renderMessagesTab(contentArea);
      break;
    default:
      console.error(`Unknown tab: ${tab}`);
  }
}

function setupSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar a");
  if (!links) return;

  links.forEach(link => {
    if (!link) return;

    link.addEventListener("click", (e) => {
      if (!e) return;

      e.preventDefault();
      links.forEach(l => {
        if (!l) return;
        l.classList.remove("active");
      });
      link.classList.add("active");
      const tab = link.getAttribute("id")?.replace("Link", "")?.toLowerCase();
      if (!tab) return;
      renderContent(tab);
    });
  });

  const signOut = document.getElementById("signOutLink");
  if (!signOut) return;

  signOut.addEventListener("click", () => {
    try {
      localStorage.clear();
      window.location.href = "/UI/Login/Login.html";
    } catch (err) {
      console.error("Error signing out:", err);
    }
  });
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
