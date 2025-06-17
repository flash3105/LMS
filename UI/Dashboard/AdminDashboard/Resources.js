const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

function loadCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './Resources.css'; 
  document.head.appendChild(link);
}

loadCSS();

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
          <!-- Remove or comment out this line -->
          <!-- <button class="tab-button" data-tab="assessments">Assessments</button> -->
        </div>
        
        <div class="tab-content active" id="resources-tab">
          <div class="existing-resources">
            <h3>Existing Resources</h3>
            <div class="resources-list" id="resourcesList">
              <!-- Resources will be loaded here -->
            </div>
          </div>
          
          <div class="add-resource">
            <h3>Add New Resource</h3>
            <form id="resourceForm">
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
                <label for="resourceDescription">Description</label>
                <textarea id="resourceDescription"></textarea>
              </div>
              
              <button type="submit" class="primary-button">Add Resource</button>
            </form>
          </div>
        </div>
        
      
    
  `;

  // Add event listeners
  container.querySelector('.back-button').addEventListener('click', () => {
    import('./AdminLearning.js').then(module => {
      module.renderadminLearning(container);
    });
  });

  // Tab switching
  container.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      container.querySelector(`#${tabName}-tab`).classList.add('active');
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

  // Load existing resources
  loadCourseResources(course._id);

  const resourceForm = container.querySelector('#resourceForm');
  if (resourceForm) {
    resourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('resourceTitle').value.trim();
      let type = document.getElementById('resourceType').value;
      const description = document.getElementById('resourceDescription').value.trim();
      const fileInput = document.getElementById('resourceFile');
      const linkInput = document.getElementById('resourceLink');
      let link = linkInput ? linkInput.value.trim() : '';
      const file = fileInput.files[0];

      // Auto-detect YouTube links
      if (link && (link.includes('youtube.com') || link.includes('youtu.be'))) {
        type = 'link'; // keep as 'link' so backend expects a link, not a file
      }

      // Validation
      if (!title || !type || (type === 'link' ? !link : !file)) {
        alert('Please fill in all required fields and attach a file or provide a link.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('description', description);
      if (type === 'link') {
        formData.append('link', link);
      } else {
        formData.append('file', file);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/courses/${course._id}/resources`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to add resource');

        loadCourseResources(course._id);
        resourceForm.reset();
        fileGroup.style.display = '';
        linkGroup.style.display = 'none';
        alert('Resource added successfully!');

      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  }
}

async function loadCourseResources(courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/resources`);
    if (!response.ok) throw new Error('Failed to load resources');
    
    const resources = await response.json();
    const resourcesList = document.getElementById('resourcesList');
    
    if (resources.length === 0) {
      resourcesList.innerHTML = '<p class="empty-message">No resources added yet</p>';
      return;
    }
    
  resourcesList.innerHTML = resources.map(resource => {
  const ext = resource.originalName ? resource.originalName.split('.').pop().toLowerCase() : '';
  const fileUrl = resource.type === 'link'
    ? resource.link
    : (resource.filePath ? `${API_BASE_URL.replace('/api', '')}/${resource.filePath.replace(/\\/g, '/')}` : '#');

  // Safely handle date display
  const displayDate = resource.createdAt 
    ? new Date(resource.createdAt).toLocaleDateString() 
    : 'Recently added';

  // Improved YouTube detection
  let isYouTube = false;
  let youTubeId = '';
  if (resource.link && (resource.type === 'link' || resource.type === 'video')) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    isYouTube = youtubeRegex.test(resource.link);
    if (isYouTube) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = resource.link.match(regExp);
      youTubeId = (match && match[2].length === 11) ? match[2] : null;
    }
  }

  // Detect if file can be viewed in browser
  const canView = resource.filePath && ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext);

  return `
    <div class="resource-item">
      <h4>${resource.title}</h4>
      <p class="resource-meta">Type: ${resource.type} • Added: ${displayDate}</p>
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
}).join('');

    // Add delete event listeners
    resourcesList.querySelectorAll('.delete-resource').forEach(btn => {
      btn.addEventListener('click', async (e) => {
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

  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('resourcesList').innerHTML = `
      <p class="error-message">Failed to load resources: ${error.message}</p>
    `;
  }
}