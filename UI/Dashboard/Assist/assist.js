export function renderAssistTab(contentArea) {
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
      <div class="faq-section" style="margin-top:2rem;">
        <h3>Frequently Asked Questions</h3>
        <div class="faq-item">
          <strong>How do I reset my password?</strong>
          <p>Go to your profile settings and click "Reset Password". Follow the instructions sent to your email.</p>
        </div>
        <div class="faq-item">
          <strong>How do I contact my instructor?</strong>
          <p>Use the Messages tab to send a direct message to your instructor.</p>
        </div>
        <div class="faq-item">
          <strong>Where can I find my grades?</strong>
          <p>Navigate to the Grades tab in your dashboard to view all your course grades.</p>
        </div>
        <div class="faq-item">
          <strong>How do I submit an assignment?</strong>
          <p>Go to the relevant course, find the assignment under Resources or Assessments, and use the upload option provided.</p>
        </div>
      </div>
    `;
  }
  
  // Submit assist request
  function submitAssistRequest(event) {
    event.preventDefault();
    alert("Support request submitted! (Simulated)");
  }