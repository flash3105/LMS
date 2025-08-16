// FolderManager.js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export function renderFolderManager(container, courseId, onFolderChange) {
  container.innerHTML = `
    <div class="folder-manager">
      <h3>Folders</h3>
      <div class="folder-actions">
        <input type="text" id="newFolderName" placeholder="New folder name">
        <button id="addFolderBtn" class="primary-button">Add</button>
      </div>
      <ul id="folderList" class="folder-list"></ul>
    </div>
  `;

  const folderList = container.querySelector('#folderList');
  const addFolderBtn = container.querySelector('#addFolderBtn');

  // Load existing folders from backend (distinct folder names for course resources)
  async function loadFolders() {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/resources`);
      const resources = await res.json();

      // Extract unique folder names
      const folders = [...new Set(resources.map(r => r.folder || "General"))];

      folderList.innerHTML = folders.map(folder => `
        <li class="folder-item" data-folder="${folder}">
          <button class="folder-button">${folder}</button>
        </li>
      `).join('');

      // Hook up click events for folder selection
      folderList.querySelectorAll('.folder-button').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = btn.textContent;
          onFolderChange(selected); // notify parent
        });
      });

    } catch (err) {
      folderList.innerHTML = `<li>Error loading folders</li>`;
      console.error(err);
    }
  }

  // Add folder manually (not persisted unless a resource uses it)
  addFolderBtn.addEventListener('click', () => {
    const newFolderInput = container.querySelector('#newFolderName');
    const folderName = newFolderInput.value.trim();
    if (!folderName) {
      alert("Please enter a folder name.");
      return;
    }

    // Immediately add to list
    const li = document.createElement('li');
    li.className = "folder-item";
    li.innerHTML = `<button class="folder-button">${folderName}</button>`;
    folderList.appendChild(li);

    li.querySelector('.folder-button').addEventListener('click', () => {
      onFolderChange(folderName);
    });

    newFolderInput.value = '';
  });

  // Initial load
  loadFolders();
}
