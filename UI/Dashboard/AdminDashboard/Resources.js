const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';
import { renderFolderManager } from './FolderManager.js';

// Utility functions
function isYouTubeLink(link) {
  return link && (link.includes('youtube.com') || link.includes('youtu.be'));
}

function getYouTubeId(link) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = link.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

{/*function loadCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './Resources.css';
  document.head.appendChild(link);
}

loadCSS();*/}

export function renderResources(container, course) {
  container.innerHTML = `
    <div class="resources-admin-container">
      <div class="resources-header">
        <h2>Manage Content: ${course.courseName}</h2>
        <button class="back-button">&larr; Back to Courses</button>
      </div>
      
      <div class="resources-tabs">
        <div class="tabs">
          <button class="tab-button active" data-tab="resources">Resources</button>
        </div>
        
        <div class="tab-content active" id="resources-tab">
          <div class="folders-section" id="folderManager"></div>
          
          <div class="resource-category-tabs">
            <button class="category-tab-button active" data-category="all">All Resources</button>
            <button class="category-tab-button" data-category="videos">Videos</button>
            <button class="category-tab-button" data-category="documents">Documents</button>
            <button class="category-tab-button" data-category="others">Other Resources</button>
          </div>
          
          <div class="existing-resources">
            <div class="resources-list" id="resourcesList"></div>
          </div>

          <div class="add-resource">
            <h3>Add New Resource</h3>
            <form id="resourceForm">
              <input type="hidden" id="resourceId">
              <div class="form-group">
                <label for="resourceTitle">Title*</label>
                <input type="text" id="resourceTitle" required>
              </div>
              
              <div class="form-group">
                <label for="resourceType">Type*</label>
                <select id="resourceType" required>
                  <option value="">Select type</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              
              <div class="form-group" id="resourceFileGroup">
                <label for="resourceFile">Attach File*</label>
                <input type="file" id="resourceFile">
              </div>
              
              <div class="form-group" id="resourceLinkGroup" style="display:none;">
                <label for="resourceLink">Link*</label>
                <input type="url" id="resourceLink" placeholder="https://...">
              </div>
              
              <div class="form-group">
                <label for="resourceFolder">Folder</label>
                <select id="resourceFolder">
                  <option value="General">General</option>
                  <option value="__new__">➕ Create New Folder</option>
                </select>
                <input type="text" id="newFolderInput" placeholder="Enter new folder name" style="display:none; margin-top:6px;">
              </div>
              
              <div class="form-group">
                <label for="resourceDescription">Description</label>
                <textarea id="resourceDescription"></textarea>
              </div>
              
              <button type="submit" class="primary-button" id="resourceSubmitButton">Add Resource</button>
              <button type="button" class="secondary-button" id="cancelEditButton" style="display:none;">Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  container.querySelector('.back-button').addEventListener('click', () => {
    import('./AdminLearning.js').then(module => {
      module.renderadminLearning(container);
    });
  });

  // Main tab switching
  container.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      container.querySelector(`#${tabName}-tab`).classList.add('active');
    });
  });

  // Resource category tab switching
  container.querySelectorAll('.category-tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      container.querySelectorAll('.category-tab-button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const allResources = container.querySelectorAll('.resource-item');
      allResources.forEach(resource => resource.style.display = 'none');
      
      if (category === 'all') {
        allResources.forEach(resource => resource.style.display = '');
      } else {
        const categoryResources = container.querySelectorAll(`.resource-item[data-category="${category}"]`);
        categoryResources.forEach(resource => resource.style.display = '');
      }
    });
  });

  // Show/hide file/link fields based on resource type
  const resourceTypeSelect = container.querySelector('#resourceType');
  const fileGroup = container.querySelector('#resourceFileGroup');
  const linkGroup = container.querySelector('#resourceLinkGroup');
  resourceTypeSelect.addEventListener('change', () => {
    const type = resourceTypeSelect.value;
    if (type === 'link') {
      fileGroup.style.display = 'none';
      linkGroup.style.display = '';
    } else {
      fileGroup.style.display = '';
      linkGroup.style.display = 'none';
    }
  });

  // Show/hide "new folder" input
  const resourceFolderSelect = container.querySelector('#resourceFolder');
  const newFolderInput = container.querySelector('#newFolderInput');
  resourceFolderSelect.addEventListener('change', () => {
    if (resourceFolderSelect.value === '__new__') {
      newFolderInput.style.display = 'block';
      newFolderInput.required = true;
    } else {
      newFolderInput.style.display = 'none';
      newFolderInput.required = false;
    }
  });

  // Load existing resources
  loadCourseResources(course._id);

  // Render Folder Manager
  const folderContainer = container.querySelector('#folderManager');
  renderFolderManager(folderContainer, course._id, (selectedFolder) => {
    try {
      loadCourseResources(course._id, selectedFolder);
    } catch (error) {
      console.error('Error loading folder resources:', error);
      document.getElementById('resourcesList').innerHTML = `
        <p class="error-message">Failed to load folder resources: ${error.message}</p>
      `;
    }
  });

  // Form submission handler
  const resourceForm = container.querySelector('#resourceForm');
  const cancelEditButton = container.querySelector('#cancelEditButton');
  
  if (resourceForm) {
    resourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const resourceId = document.getElementById('resourceId').value;
      const title = document.getElementById('resourceTitle').value.trim();
      let type = document.getElementById('resourceType').value;
      const description = document.getElementById('resourceDescription').value.trim();
      let folder = document.getElementById('resourceFolder').value;
      const fileInput = document.getElementById('resourceFile');
      const linkInput = document.getElementById('resourceLink');
      let link = linkInput ? linkInput.value.trim() : '';
      const file = fileInput.files[0];

      // Handle new folder case
      if (folder === '__new__') {
        folder = newFolderInput.value.trim();
        if (!folder) {
          alert('Please enter a new folder name.');
          return;
        }
      }

      // Auto-detect YouTube links
      if (link && isYouTubeLink(link)) {
        type = 'link';
      }

      // Validation
      if (!title || !type || (type === 'link' ? !link : !file && !resourceId)) {
        alert('Please fill in all required fields and attach a file or provide a link.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('folder', folder);
      
      if (type === 'link') {
        formData.append('link', link);
      } else if (file) {
        formData.append('file', file);
      }

      try {
        const url = resourceId 
          ? `${API_BASE_URL}/resources/${resourceId}`
          : `${API_BASE_URL}/courses/${course._id}/resources`;
          
        const method = resourceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save resource');
        }

        loadCourseResources(course._id);
        resetResourceForm();
        alert(resourceId ? 'Resource updated successfully!' : 'Resource added successfully!');

      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  }

  // Cancel edit handler
  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', resetResourceForm);
  }

  function resetResourceForm() {
    document.getElementById('resourceForm').reset();
    document.getElementById('resourceId').value = '';
    document.getElementById('resourceSubmitButton').textContent = 'Add Resource';
    cancelEditButton.style.display = 'none';
    fileGroup.style.display = '';
    linkGroup.style.display = 'none';
    newFolderInput.style.display = 'none';
    newFolderInput.required = false;
  }

  function populateEditForm(resource) {
    document.getElementById('resourceId').value = resource._id;
    document.getElementById('resourceTitle').value = resource.title;
    document.getElementById('resourceType').value = resource.type;
    document.getElementById('resourceDescription').value = resource.description || '';
    document.getElementById('resourceFolder').value = resource.folder || 'General';
    document.getElementById('resourceSubmitButton').textContent = 'Update Resource';
    cancelEditButton.style.display = 'inline-block';
    
    if (resource.type === 'link') {
      document.getElementById('resourceLink').value = resource.link || '';
      fileGroup.style.display = 'none';
      linkGroup.style.display = '';
    } else {
      fileGroup.style.display = '';
      linkGroup.style.display = 'none';
    }
  }
}

function extractFoldersFromResources(resources) {
  const folders = new Set(['General']);
  resources.forEach(resource => {
    if (resource.folder && resource.folder.trim() !== '') {
      folders.add(resource.folder);
    }
  });
  return Array.from(folders);
}

// Loads and displays course resources
async function loadCourseResources(courseId, folder = null) {
  try {
    let response = await fetch(`${API_BASE_URL}/courses/${courseId}/resources`);
    if (!response.ok) throw new Error('Failed to load resources');
    
    let resources = await response.json();
    const resourcesList = document.getElementById('resourcesList');
    
    // Extract and populate folders from resources
    const folders = extractFoldersFromResources(resources);
    const folderSelect = document.getElementById('resourceFolder');
    
    // Clear existing options
    folderSelect.innerHTML = '';
    const generalOption = document.createElement('option');
    generalOption.value = 'General';
    generalOption.textContent = 'General';
    folderSelect.appendChild(generalOption);

    // Add new folder options
    folders.forEach(folderName => {
      if (folderName !== 'General') {
        const option = document.createElement('option');
        option.value = folderName;
        option.textContent = folderName;
        folderSelect.appendChild(option);
      }
    });

    // Add "Create New Folder" option
    const createNewOption = document.createElement('option');
    createNewOption.value = "__new__";
    createNewOption.textContent = "➕ Create New Folder";
    folderSelect.appendChild(createNewOption);

    if (resources.length === 0) {
      resourcesList.innerHTML = '<p class="empty-message">No resources added yet</p>';
      return;
    }

    // Filter by folder if specified
    if (folder && folder !== "all") {
      resources = resources.filter(r => (r.folder || "General") === folder);
    }

    // Generate HTML for all resources with category data attributes
    resourcesList.innerHTML = resources.map(resource => {
      const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
      
      let category = 'others';
      if (resource.type === 'link' && isYouTubeLink(resource.link)) {
        category = 'videos';
      } else if (resource.type === 'video' || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
        category = 'videos';
      } else if (resource.type === 'document' || ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'xls', 'xlsx'].includes(ext)) {
        category = 'documents';
      }
      
      return createResourceItem(resource, category);
    }).join('');
    
    // Add delete event listeners
    resourcesList.querySelectorAll('.delete-resource').forEach(btn => {
      btn.addEventListener('click', async () => {
        const resourceId = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this resource?')) {
          try {
            const res = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete resource');
            alert('Resource deleted!');
            loadCourseResources(courseId);
          } catch (err) {
            alert('Error deleting resource: ' + err.message);
          }
        }
      });
    });

    // Add edit event listeners
    resourcesList.querySelectorAll('.edit-resource').forEach(btn => {
      btn.addEventListener('click', () => {
        const resourceId = btn.getAttribute('data-id');
        const resource = resources.find(r => r._id === resourceId);
        if (resource) {
          populateEditForm(resource);
        }
      });
    });

  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('resourcesList').innerHTML = `
      <p class="error-message">Failed to load resources: ${error.message}</p>
    `;
  }
}

// Creates HTML for a resource item
function createResourceItem(resource, category) {
  const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
  const fileUrl = resource.type === 'link'
    ? resource.link
    : (resource.filePath ? `${API_BASE_URL.replace('/api', '')}/${resource.filePath.replace(/\\/g, '/')}` : '#');

  const displayDate = resource.createdAt 
    ? new Date(resource.createdAt).toLocaleDateString() 
    : 'Recently added';

  let isYouTube = false;
  let youTubeId = '';
  if (resource.link && (resource.type === 'link' || resource.type === 'video')) {
    isYouTube = isYouTubeLink(resource.link);
    if (isYouTube) {
      youTubeId = getYouTubeId(resource.link);
    }
  }

  const canView = resource.filePath && ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);

  return `
    <div class="resource-item" data-category="${category}">
      <h4>${resource.title}</h4>
      <p class="resource-meta">
        Type: ${resource.type} • 
        Folder: ${resource.folder || 'General'} • 
        Added: ${displayDate}
      </p>
      <p>${resource.description || 'No description'}</p>
      
      <div class="resource-actions">
        ${resource.type === 'link' ? `
          <a href="${resource.link}" target="_blank" class="primary-button" style="margin-right:8px;">
            Open Link
          </a>
        ` : ''}
        ${resource.filePath && resource.type !== 'link' ? `
          <a href="${fileUrl}" target="_blank" class="primary-button" style="margin-right:8px;">
            ${canView ? 'View' : 'Download'}
          </a>
        ` : ''}
        <button class="edit-resource" data-id="${resource._id}">Edit</button>
        <button class="delete-resource" data-id="${resource._id}">Delete</button>
      </div>
      
      ${isYouTube && youTubeId ? `
        <div style="margin-top:10px;">
          <iframe width="100%" height="315" 
                  src="https://www.youtube.com/embed/${youTubeId}" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>
      ` : ''}
    </div>
  `;
}
