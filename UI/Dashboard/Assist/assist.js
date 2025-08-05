export function renderAssistTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Need Help?</h2>
      <p class="text-muted">Ask the AI Tutor a question related to your studies.</p>
    </div>
    <div class="assist-section">
      <form id="aiTutorForm">
        <div class="mb-3">
          <label for="assistSubject" class="form-label">Subject</label>
          <input type="text" class="form-control" id="assistSubject" placeholder="e.g., Physics, Algebra" required>
        </div>
        <div class="mb-3">
          <label for="assistMessage" class="form-label">Your Question</label>
          <textarea class="form-control" id="assistMessage" rows="4" placeholder="e.g., Can you explain Ohm's Law?" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Ask Tutor</button>
      </form>
      <div id="tutorResponse" class="mt-4" style="display:none;">
        <h5>AI Tutor Response:</h5>
        <div id="responseContent" class="border rounded p-3 bg-light text-dark"></div>
      </div>
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

  // Add submit event listener after form is inserted into the DOM
  const form = document.getElementById('aiTutorForm');
  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const subject = document.getElementById('assistSubject').value.trim();
    const message = document.getElementById('assistMessage').value.trim();
    const fullPrompt = `${subject}: ${message}`;

    const responseBox = document.getElementById('tutorResponse');
    const responseContent = document.getElementById('responseContent');
    responseBox.style.display = 'block';
    responseContent.innerHTML = `<em>Thinking...</em>`;

    try {
      const res = await fetch('http://localhost:5050/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: fullPrompt })
      });

      const data = await res.json();
      if (data.answer) {
        responseContent.innerText = data.answer;
      } else {
        responseContent.innerText = "Sorry, something went wrong. Please try again.";
      }
    } catch (error) {
      responseContent.innerText = "Failed to reach the tutor service.";
    }
  });
}
