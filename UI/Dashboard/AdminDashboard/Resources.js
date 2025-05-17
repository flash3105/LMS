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
          <button class="tab-button" data-tab="assessments">Assessments</button>
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
                  <option value="link">External Link</option>
                </select>
              </div>
              
              
              
              <div class="form-group" id="resourceFileGroup">
                <label for="resourceFile">Attach File*</label>
                <input type="file" id="resourceFile" ${/* required if you want to enforce */''}>
              </div>
              
              <div class="form-group">
                <label for="resourceDescription">Description</label>
                <textarea id="resourceDescription"></textarea>
              </div>
              
              <button type="submit" class="primary-button">Add Resource</button>
            </form>
          </div>
        </div>
        
        <div class="tab-content" id="assessments-tab">
          <div class="existing-assessments">
            <h3>Existing Assessments</h3>
            <div class="assessments-list" id="assessmentsList">
              <!-- Assessments will be loaded here -->
            </div>
          </div>
          
          <div class="add-assessment">
            <h3>Add New Assessment</h3>
            <form id="assessmentForm">
              <!-- Assessment form fields -->
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  container.querySelector('.back-button').addEventListener('click', () => {
    // You'll need to import and call your original admin learning render function here
    // For example:
    import('./AdminLearning.js').then(module => {
      module.renderadminLearning(container);
    });
  });

  // Tab switching
  container.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      
      // Update active tab button
      container.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Update active tab content
      container.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      container.querySelector(`#${tabName}-tab`).classList.add('active');
    });
  });

  // Load existing resources
  loadCourseResources(course._id);

  const resourceForm = container.querySelector('#resourceForm');
  if (resourceForm) {
    resourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('resourceTitle').value.trim();
      const type = document.getElementById('resourceType').value;
      const description = document.getElementById('resourceDescription').value.trim();
      const fileInput = document.getElementById('resourceFile');
      const file = fileInput.files[0];

      if (!title || !type || !file) {
        alert('Please fill in all required fields and attach a file.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('file', file);

      try {
        const response = await fetch(`http://localhost:5000/api/courses/${course._id}/resources`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add resource');
        // Reload resources
        loadCourseResources(course._id);
        resourceForm.reset();
        alert('Resource added!');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  }
}

async function loadCourseResources(courseId) {
  try {
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}/resources`);
    if (!response.ok) throw new Error('Failed to load resources');
    
    const resources = await response.json();
    const resourcesList = document.getElementById('resourcesList');
    
    if (resources.length === 0) {
      resourcesList.innerHTML = '<p class="empty-message">No resources added yet</p>';
      return;
    }
    
    resourcesList.innerHTML = resources.map(resource => `
      <div class="resource-item">
        <h4>${resource.title}</h4>
        <p class="resource-meta">Type: ${resource.type} • Added: ${new Date(resource.createdAt).toLocaleDateString()}</p>
        <p>${resource.description || 'No description'}</p>
        <div class="resource-actions">
          <button class="edit-resource" data-id="${resource._id}">Edit</button>
          <button class="delete-resource" data-id="${resource._id}">Delete</button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('resourcesList').innerHTML = `
      <p class="error-message">Failed to load resources: ${error.message}</p>
    `;
  }
}