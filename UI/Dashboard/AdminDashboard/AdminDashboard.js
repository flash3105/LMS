// Ensure the script is treated as a module
import { renderSidebar } from '../Components/Sidebar.js';

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (sidebarContainer) sidebarContainer.innerHTML = renderSidebar();

  
});

