export function renderContent(tab) {
    const contentArea = document.getElementById("contentArea");
    contentArea.innerHTML = "";
  
    switch (tab) {
      case "home":
        renderHomeTab(contentArea);
        break;
      case "profile":
        contentArea.innerHTML = renderProfileSection(currentUser);
        break;
      case "learning":
        renderLearningTab(contentArea);
        break;
      case "assessments":
        renderAssessmentsTab(contentArea);
        break;
      case "messages":
        renderMessagesTab(contentArea);
        break;
      case "assist":
        renderAssistTab(contentArea);
        break;
    }
  }
  