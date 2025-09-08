export function renderAssistTab(contentArea) {
  // Load CSS for assist tab
  const style = document.createElement('style');
  style.textContent = `
    .assist-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      min-height: 100vh;
    }
    .profile-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg,rgb(125, 152, 173) 0%, #3182ce 100%);
    }
    
    .welcome {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    
    .welcome h2 {
      color:rgb(26, 115, 150);
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .welcome p {
      color:rgb(39, 106, 177);
      font-size: 1.1rem;
    }
  
    .assist-section, .faq-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }
    
    .section-title {
      color: #2c3e50;
      font-size: 1.5rem;
      margin: 0 0 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(44, 62, 80, 0.1);
    }
    
    .support-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #3182ce;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 1rem;
      width: 100%;
      transition: border-color 0.2s ease;
    }
    
    .form-control:focus {
      border-color: #3182ce;
      box-shadow: 0 0 0 0.2rem rgba(49, 130, 206, 0.25);
      outline: none;
    }
    
    .submit-btn {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    
    .form-status {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      display: none;
    }
    
    .form-status.success {
      display: block;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .form-status.error {
      display: block;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .faq-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s ease;
    }
    
    .faq-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .faq-question {
      padding: 1.5rem;
      background: #f8f9fa;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #2c3e50;
      transition: background-color 0.2s ease;
    }
    
    .faq-question:hover {
      background: #e9ecef;
    }
    
    .faq-question::after {
      content: '▼';
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }
    
    .faq-question.active::after {
      transform: rotate(180deg);
    }
    
    .faq-answer {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      background: white;
      transition: all 0.3s ease;
    }
    
    .faq-answer.active {
      padding: 1.5rem;
      max-height: 200px;
      border-top: 1px solid #e9ecef;
    }
    
    .faq-answer p {
      margin: 0;
      color: #495057;
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .assist-container {
        padding: 1rem;
      }
      
      .assist-section, .faq-section {
        padding: 1.5rem;
      }
      
      .faq-question {
        padding: 1rem;
      }
      
      .faq-answer.active {
        padding: 1rem;
      }
    }
  `;
  document.head.appendChild(style);

  contentArea.innerHTML = `
    <div class="profile-container">
      <div class="welcome">
        <h2>Need Help?</h2>
        <p>We're here to support your learning journey</p>
      </div>
      
      <div class="assist-section">
        <div class="section-title">Submit a Support Request</div>
        <form class="support-form" id="assistForm">
          <div class="form-group">
            <label for="assistSubject" class="form-label">Subject</label>
            <input type="text" class="form-control" id="assistSubject" placeholder="Enter subject" required>
          </div>
          <div class="form-group">
            <label for="assistMessage" class="form-label">Message</label>
            <textarea class="form-control" id="assistMessage" rows="4" placeholder="Describe your issue in detail..." required></textarea>
          </div>
          <button type="submit" class="submit-btn">Submit Request</button>
          <div id="formStatus" class="form-status"></div>
        </form>
      </div>
      
      <div class="faq-section">
        <div class="section-title">Frequently Asked Questions</div>
        <div class="faq-list">
          <div class="faq-card">
            <button class="faq-question">How do I reset my password?</button>
            <div class="faq-answer">
              <p>Go to your profile settings and click "Reset Password". Follow the instructions sent to your email. If you don't receive the email within 5 minutes, check your spam folder.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question">How do I contact my instructor?</button>
            <div class="faq-answer">
              <p>Use the Messages tab to send a direct message to your instructor. They typically respond within 24-48 hours during weekdays.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question">Where can I find my grades?</button>
            <div class="faq-answer">
              <p>Navigate to the Grades tab in your dashboard to view all your course grades. You can also see detailed feedback from instructors on your assignments.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question">How do I submit an assignment?</button>
            <div class="faq-answer">
              <p>Go to the relevant course, find the assignment under Resources or Assessments, and use the upload option provided. Make sure to submit before the due date to avoid penalties.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question">What are the system requirements?</button>
            <div class="faq-answer">
              <p>The platform works best on modern browsers like Chrome, Firefox, Safari, or Edge. Ensure you have JavaScript enabled and a stable internet connection for the best experience.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question">How do I enroll in a course?</button>
            <div class="faq-answer">
              <p>Navigate to the Courses tab, browse available courses, and click the "Enroll" button on any course you're interested in. Some courses may require instructor approval.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners after the HTML is rendered
  const assistForm = document.getElementById('assistForm');
  assistForm.addEventListener('submit', submitAssistRequest);
  
  // Add FAQ toggle functionality
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      toggleFAQ(this);
    });
  });

  // Add the toggle function to the global scope
  window.toggleFAQ = function(button) {
    const faqCard = button.parentElement;
    const answer = button.nextElementSibling;
    const isActive = answer.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer.active').forEach(item => {
      if (item !== answer) {
        item.classList.remove('active');
        item.previousElementSibling.classList.remove('active');
      }
    });
    
    // Toggle current FAQ
    button.classList.toggle('active');
    answer.classList.toggle('active');
  };
}

// Submit assist request
async function submitAssistRequest(event) {
  event.preventDefault();
  

  // 1. Get form elements
  const form = event.target;
  const submitButton = form.querySelector('.submit-btn');
  const statusEl = document.getElementById('formStatus');

  // 2. Setup loading state - PREVENTS MULTIPLE SUBMISSIONS
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;
  statusEl.style.display = 'none'; // Hide previous status messages

  // 3. Get form data
  const subject = document.getElementById('assistSubject').value.trim();
  const message = document.getElementById('assistMessage').value.trim();
  const token = localStorage.getItem("token"); // assuming JWT is stored here

  if (!subject || !message) {
    statusEl.textContent = "Please fill in both subject and message.";
    statusEl.className = 'form-status error';
    statusEl.style.display = 'block';
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    return;
  }

  if (!token) {
    statusEl.textContent = "You are not logged in. Redirecting to login page...";
    statusEl.className = 'form-status error';
    statusEl.style.display = 'block';
    submitButton.textContent = originalText;
    submitButton.disabled = false;

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = '/'; // adjust path to your login page
    }, 1500);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ subject, message })
    });


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let userMessage;
      switch (response.status) {
        case 400:
          userMessage = errorData.error || "Please fill in all required fields.";
          break;
        case 401:
          userMessage = "Session expired. Redirecting to login...";
          statusEl.textContent = userMessage;
          statusEl.className = 'form-status error';
          statusEl.style.display = 'block';
          
          // Redirect after short delay
          setTimeout(() => {
            window.location.href = '/'; 
          }, 1500);
          return;
        case 403:
          userMessage = "You do not have permission to submit this request.";
          break;
        case 500:
          userMessage = "Server error occurred. Please try again later.";
          break;
        default:
          userMessage = errorData.error || `Unexpected error: ${response.status}`;
      }

      if (response.status !== 401) throw new Error(userMessage);
    }

    const result = await response.json();

    // 4. Show SUCCESS feedback in the UI
    statusEl.textContent = "Request submitted! We'll get back to you within 24 hours.";
    statusEl.className = 'form-status success';
    statusEl.style.display = 'block';

    // 5. Clear the form
    form.reset();

    // 6. Refresh user's requests list (if function exists)
    if (typeof fetchUserRequests === 'function') {
      fetchUserRequests();
    }

  } catch (error) {
    console.error("Error submitting request:", error);

    // 7. Show ERROR feedback in the UI (non-401 errors)
    statusEl.textContent = `Failed to submit request. ${error.message}`;
    statusEl.className = 'form-status error';
    statusEl.style.display = 'block';

  } finally {
    // 8. Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// Make the function globally available
window.submitAssistRequest = submitAssistRequest;