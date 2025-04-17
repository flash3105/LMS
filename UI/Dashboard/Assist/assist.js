function renderAssistTab(contentArea) {
    contentArea.innerHTML = `
      <div class="welcome">
        <h2 class="fw-bold">Need Help?</h2>
        <p class="text-muted">Submit a support request.</p>
      </div>
      <div class="assist-section">
        <form onsubmit="submitAssistRequest(event)">
          <div class="mb-3">
            <label for="assistSubject" class="form-label">Subject</label>
            <input type="text" class="form-control" id="assistSubject" placeholder="Enter subject" required>
          </div>
          <div class="mb-3">
            <label for="assistMessage" class="form-label">Message</label>
            <textarea class="form-control" id="assistMessage" rows="4" placeholder="Describe your issue..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
      </div>
    `;
  }
  
  // Submit assist request
  function submitAssistRequest(event) {
    event.preventDefault();
    alert("Support request submitted! (Simulated)");
  }