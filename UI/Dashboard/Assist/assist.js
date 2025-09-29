const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export function renderAssistTab(contentArea) {
  // Load CSS
  const style = document.createElement('style');
  style.textContent = `
    /* Mobile-first styles */
    .tutor-container {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin: 0;
      height: 100vh;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: #2c3e50;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      position: relative;
      overflow: hidden;
    }

    .welcome {
      text-align: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      margin-bottom: 0;
    }

    .welcome h2 {
      font-size: 1.4rem;
      margin: 0 0 0.25rem 0;
      font-weight: 700;
      color: white;
    }

    .welcome p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
    }

    .chat-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 20px 20px 0 0;
      padding: 1rem;
      overflow: hidden;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .subject-selectors {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .selector-group {
      display: flex;
      flex-direction: column;
    }

    .selector-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .selector-group select {
      padding: 0.75rem;
      border-radius: 10px;
      border: 1px solid #ddd;
      background: white;
      font-size: 1rem;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1rem;
    }

    .chat-box {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: #fafafa;
      border-radius: 12px;
      margin-bottom: 0.75rem;
    }

    .message {
      display: flex;
      max-width: 85%;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      animation: fadeIn 0.3s ease;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .user-message {
      background: #d1e7ff;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
    }

    .ai-message {
      background: #e9ecef;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
    }

    .chat-form {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 25px;
      border: 1px solid #e0e0e0;
    }

    .form-control {
      flex: 1;
      border: none;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      background: transparent;
      outline: none;
    }

    .submit-btn {
      border-radius: 50%;
      border: none;
      background: #3182ce;
      color: white;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }

    .submit-btn:hover {
      background: #2261a8;
    }

    .submit-btn svg {
      width: 20px;
      height: 20px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .typing-indicator {
      align-self: flex-start;
      background: #e9ecef;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      color: #666;
      font-style: italic;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom-left-radius: 5px;
    }

    .typing-dots {
      display: flex;
      gap: 3px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      background: #888;
      border-radius: 50%;
      animation: typingAnimation 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingAnimation {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    .quick-prompts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .quick-prompt-btn {
      padding: 0.75rem;
      background: rgba(49, 130, 206, 0.1);
      border: 1px solid rgba(49, 130, 206, 0.2);
      border-radius: 10px;
      font-size: 0.85rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #3182ce;
    }

    .quick-prompt-btn:hover {
      background: rgba(49, 130, 206, 0.2);
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .tutor-container {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
        height: 90vh;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .welcome {
        background: transparent;
        backdrop-filter: none;
        margin-bottom: 1rem;
      }

      .welcome h2 {
        font-size: 2rem;
        color: #1b8ee0;
      }

      .welcome p {
        color: #1e87d2;
      }

      .chat-section {
        border-radius: 12px;
        box-shadow: none;
      }

      .subject-selectors {
        grid-template-columns: 1fr 1fr;
        display: grid;
      }

      .message {
        max-width: 75%;
      }

      .quick-prompts {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Large mobile devices */
    @media (min-width: 480px) and (max-width: 767px) {
      .quick-prompts {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .chat-section {
        background: #2d3748;
        color: #e2e8f0;
      }

      .section-title {
        color: #e2e8f0;
      }

      .subject-selectors {
        background: #4a5568;
        border-color: #4a5568;
      }

      .selector-group label {
        color: #e2e8f0;
      }

      .selector-group select {
        background: #2d3748;
        color: #e2e8f0;
        border-color: #4a5568;
      }

      .chat-box {
        background: #4a5568;
      }

      .user-message {
        background: #3182ce;
        color: white;
      }

      .ai-message {
        background: #4a5568;
        color: #e2e8f0;
        border: 1px solid #718096;
      }

      .chat-form {
        background: #4a5568;
        border-color: #4a5568;
      }

      .form-control {
        color: #e2e8f0;
      }

      .form-control::placeholder {
        color: #a0aec0;
      }

      .quick-prompt-btn {
        background: rgba(49, 130, 206, 0.15);
        border-color: rgba(49, 130, 206, 0.3);
        color: #90cdf4;
      }

      .typing-indicator {
        background: #4a5568;
        color: #a0aec0;
      }

      .typing-dot {
        background: #a0aec0;
      }
    }
  `;
  document.head.appendChild(style);

  contentArea.innerHTML = `
    <div class="tutor-container">
      <div class="welcome">
        <h2>AI Tutor - CAPS Curriculum</h2>
        <p>Ask me anything and I'll help you learn more!</p>
      </div>

      <div class="chat-section">
        <div class="section-title">Chat with your Tutor</div>
        
        <div class="subject-selectors">
          <div class="selector-group">
            <label for="subjectSelect">Subject:</label>
            <select id="subjectSelect">
              <option value="">Select a subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physical-sciences">Physical Sciences</option>
              <option value="life-sciences">Life Sciences</option>
              <option value="english">English Home Language</option>
              <option value="afrikaans">Afrikaans</option>
              <option value="geography">Geography</option>
              <option value="history">History</option>
              <option value="economics">Economics</option>
              <option value="business-studies">Business Studies</option>
              <option value="accounting">Accounting</option>
            </select>
          </div>
          <div class="selector-group">
            <label for="topicSelect">Topic:</label>
            <select id="topicSelect">
              <option value="">Select a topic</option>
              <!-- Topics will be populated based on subject selection -->
            </select>
          </div>
        </div>

        <div class="quick-prompts">
          <div class="quick-prompt-btn" onclick="useQuickPrompt('explain')">Explain a concept</div>
          <div class="quick-prompt-btn" onclick="useQuickPrompt('example')">Give me an example</div>
          <div class="quick-prompt-btn" onclick="useQuickPrompt('study')">Study techniques</div>
          <div class="quick-prompt-btn" onclick="useQuickPrompt('problem')">Solve a problem</div>
          <div class="quick-prompt-btn" onclick="useQuickPrompt('summary')">Summary of topic</div>
          <div class="quick-prompt-btn" onclick="useQuickPrompt('exam')">Exam preparation</div>
        </div>
        
        <div id="chatBox" class="chat-box"></div>
        <form class="chat-form" id="tutorForm">
          <input type="text" id="tutorInput" class="form-control" placeholder="Type your question..." required>
          <button type="submit" class="submit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  // Add event listeners
  const form = contentArea.querySelector('#tutorForm');
  form.addEventListener('submit', submitTutorPrompt);

  // Add subject change listener
  const subjectSelect = contentArea.querySelector('#subjectSelect');
  subjectSelect.addEventListener('change', updateTopics);

  // Initialize topics
  updateTopics();
}

// CAPS Curriculum Topics
const CAPS_TOPICS = {
  mathematics: [
    "Algebra", "Calculus", "Geometry", "Trigonometry", "Statistics", 
    "Probability", "Functions", "Financial Mathematics", "Euclidean Geometry"
  ],
  "physical-sciences": [
    "Mechanics", "Electricity & Magnetism", "Waves & Sound", "Light", 
    "Matter & Materials", "Chemical Change", "Chemical Systems", "Energy & Change"
  ],
  "life-sciences": [
    "Cells", "Biochemistry", "Genetics", "Evolution", "Ecology", 
    "Human Physiology", "Plant Physiology", "Environmental Studies"
  ],
  english: [
    "Comprehension", "Essay Writing", "Creative Writing", "Poetry", 
    "Drama", "Novel Study", "Language Structures", "Oral Presentation"
  ],
  afrikaans: [
    "Begrip", "Opstel", "Kreatiewe Skryf", "Poësie", "Drama", 
    "Romanstudie", "Taalstrukture", "Mondelinge Aanbieding"
  ],
  geography: [
    "Map Skills", "Climate & Weather", "Geomorphology", "Population", 
    "Settlement", "Economic Geography", "Development", "Environmental Issues"
  ],
  history: [
    "World Wars", "Cold War", "Apartheid", "Civil Rights", 
    "Ancient Civilizations", "Colonialism", "African History", "South African History"
  ],
  economics: [
    "Microeconomics", "Macroeconomics", "Circular Flow", "Market Structures", 
    "Labour Market", "International Trade", "Economic Growth", "Development"
  ],
  "business-studies": [
    "Business Environments", "Operations", "Marketing", "Finance", 
    "Human Resources", "Business Ventures", "Business Roles", "Entrepreneurship"
  ],
  accounting: [
    "Financial Statements", "Ledger Accounts", "Ratios", "Budgeting", 
    "Cost Accounting", "Partnerships", "Companies", "Ethics"
  ]
};

// Quick prompts for mobile users
const QUICK_PROMPTS = {
  explain: "Can you explain this concept in simple terms?",
  example: "Could you provide a practical example of this?",
  study: "What are the best study techniques for this topic?",
  problem: "Can you help me solve this problem step by step?",
  summary: "Please provide a summary of the key points about",
  exam: "What should I focus on for exam preparation regarding"
};

// Use quick prompt based on selected subject/topic
function useQuickPrompt(type) {
  const input = document.getElementById('tutorInput');
  const subject = document.getElementById('subjectSelect').value;
  const topic = document.getElementById('topicSelect').value;
  
  let prompt = QUICK_PROMPTS[type] || "Can you help me with this?";
  
  if (subject && topic) {
    const subjectName = document.getElementById('subjectSelect').options[document.getElementById('subjectSelect').selectedIndex].text;
    const topicName = document.getElementById('topicSelect').options[document.getElementById('topicSelect').selectedIndex].text;
    
    if (type === 'summary' || type === 'exam') {
      prompt = `${prompt} ${topicName} in ${subjectName}`;
    } else {
      prompt = `Regarding ${topicName} in ${subjectName}: ${prompt}`;
    }
  }
  
  input.value = prompt;
  input.focus();
}

// Update topics based on selected subject
function updateTopics() {
  const subjectSelect = document.getElementById('subjectSelect');
  const topicSelect = document.getElementById('topicSelect');
  const selectedSubject = subjectSelect.value;
  
  // Clear existing topics
  topicSelect.innerHTML = '<option value="">Select a topic</option>';
  
  if (selectedSubject && CAPS_TOPICS[selectedSubject]) {
    CAPS_TOPICS[selectedSubject].forEach(topic => {
      const option = document.createElement('option');
      option.value = topic.toLowerCase().replace(/\s+/g, '-');
      option.textContent = topic;
      topicSelect.appendChild(option);
    });
  }
}

// Submit tutor prompt with subject/topic context
async function submitTutorPrompt(event) {
  event.preventDefault();
  const input = document.getElementById('tutorInput');
  const chatBox = document.getElementById('chatBox');
  const userMessage = input.value.trim();
  const subject = document.getElementById('subjectSelect').value;
  const topic = document.getElementById('topicSelect').value;

  if (!userMessage) return;

  // Create context-aware prompt
  let contextPrompt = userMessage;
  if (subject) {
    const subjectName = document.getElementById('subjectSelect').options[document.getElementById('subjectSelect').selectedIndex].text;
    if (topic) {
      const topicName = document.getElementById('topicSelect').options[document.getElementById('topicSelect').selectedIndex].text;
      contextPrompt = `Considering the CAPS curriculum for ${subjectName}, specifically the topic of ${topicName}: ${userMessage}`;
    } else {
      contextPrompt = `Considering the CAPS curriculum for ${subjectName}: ${userMessage}`;
    }
  }

  // Append user message (show original, not the context-enhanced one)
  chatBox.innerHTML += `<div class="message user-message">${userMessage}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = '';

  // Show typing indicator
  chatBox.innerHTML += `
    <div class="typing-indicator" id="typingIndicator">
      <span>AI Tutor is thinking</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // Call backend AI route with context-enhanced prompt
    const aiResponse = await callGeminiAPI(contextPrompt);
    
    // Remove typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();

    // Append AI response
    chatBox.innerHTML += `<div class="message ai-message">${aiResponse}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (error) {
    // Remove typing indicator on error
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
    
    chatBox.innerHTML += `<div class="message ai-message">Sorry, I'm having trouble connecting right now. Please try again.</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Gemini API call
async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.reply || "Sorry, I couldn't process that question. Could you try rephrasing it?";
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Make functions globally available
window.submitTutorPrompt = submitTutorPrompt;
window.callGeminiAPI = callGeminiAPI;
window.updateTopics = updateTopics;
window.useQuickPrompt = useQuickPrompt;