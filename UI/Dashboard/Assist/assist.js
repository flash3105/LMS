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
      transition: transform 0.2s ease;
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
        <form class="support-form" onsubmit="submitAssistRequest(event)">
          <div class="form-group">
            <label for="assistSubject" class="form-label">Subject</label>
            <input type="text" class="form-control" id="assistSubject" placeholder="Enter subject" required>
          </div>
          <div class="form-group">
            <label for="assistMessage" class="form-label">Message</label>
            <textarea class="form-control" id="assistMessage" rows="4" placeholder="Describe your issue in detail..." required></textarea>
          </div>
          <button type="submit" class="submit-btn">Submit Request</button>
        </form>
      </div>
      
      <div class="faq-section">
        <div class="section-title">Frequently Asked Questions</div>
        <div class="faq-list">
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              How do I reset my password?
            </button>
            <div class="faq-answer">
              <p>Go to your profile settings and click "Reset Password". Follow the instructions sent to your email. If you don't receive the email within 5 minutes, check your spam folder.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              How do I contact my instructor?
            </button>
            <div class="faq-answer">
              <p>Use the Messages tab to send a direct message to your instructor. They typically respond within 24-48 hours during weekdays.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              Where can I find my grades?
            </button>
            <div class="faq-answer">
              <p>Navigate to the Grades tab in your dashboard to view all your course grades. You can also see detailed feedback from instructors on your assignments.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              How do I submit an assignment?
            </button>
            <div class="faq-answer">
              <p>Go to the relevant course, find the assignment under Resources or Assessments, and use the upload option provided. Make sure to submit before the due date to avoid penalties.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              What are the system requirements?
            </button>
            <div class="faq-answer">
              <p>The platform works best on modern browsers like Chrome, Firefox, Safari, or Edge. Ensure you have JavaScript enabled and a stable internet connection for the best experience.</p>
            </div>
          </div>
          
          <div class="faq-card">
            <button class="faq-question" onclick="toggleFAQ(this)">
              How do I enroll in a course?
            </button>
            <div class="faq-answer">
              <p>Navigate to the Courses tab, browse available courses, and click the "Enroll" button on any course you're interested in. Some courses may require instructor approval.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

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
function submitAssistRequest(event) {
  event.preventDefault();
  const subject = document.getElementById('assistSubject').value;
  const message = document.getElementById('assistMessage').value;
  
  // Simulate submission
  alert(`Support request submitted successfully!\n\nSubject: ${subject}\n\nWe'll get back to you within 24 hours.`);
  
  // Clear form
  document.getElementById('assistSubject').value = '';
  document.getElementById('assistMessage').value = '';
}