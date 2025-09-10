const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export function renderAssistTab(contentArea) {
  // Load CSS
  const style = document.createElement('style');
  style.textContent = `
    .tutor-container {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
      height: 90vh;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      color: #2c3e50;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .welcome {
      text-align: center;
      margin-bottom: 1rem;
    }

    .welcome h2 {
      font-size: 2rem;
      margin: 0;
      font-weight: 700;
      color: #1b8ee0ff;
    }

    .welcome p {
      margin: 0;
      color: #1e87d2ff;
    }

    .chat-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      padding: 1rem;
      overflow: hidden;
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    

    .subject-selectors {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      background: white;
      font-size: 0.9rem;
    }

    .chat-box {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .message {
      display: flex;
      max-width: 75%;
      padding: 0.75rem 1rem;
      border-radius: 20px;
      animation: fadeIn 0.3s ease;
    }

    .user-message {
      background: #d1e7ff;
      align-self: flex-end;
      text-align: right;
    }

    .ai-message {
      background: #e9ecef;
      align-self: flex-start;
      text-align: left;
    }

    .chat-form {
      display: flex;
      gap: 0.5rem;
    }

    .form-control {
      flex: 1;
      border-radius: 20px;
      border: 1px solid #ccc;
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }

    .submit-btn {
      border-radius: 20px;
      border: none;
      background: #3182ce;
      color: white;
      padding: 0 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .submit-btn:hover {
      background: #2261a8;
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .typing-indicator {
      align-self: flex-start;
      background: #e9ecef;
      padding: 0.75rem 1rem;
      border-radius: 20px;
      color: #666;
      font-style: italic;
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
        

        <div id="chatBox" class="chat-box"></div>
        <form class="chat-form" id="tutorForm">
          <input type="text" id="tutorInput" class="form-control" placeholder="Type your question..." required>
          <button type="submit" class="submit-btn">Send</button>
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

  // Make prompt functions globally available
  window.usePrompt = usePrompt;
  window.updateTopics = updateTopics;

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

// Guided prompts library for CAPS curriculum
/*const PROMPT_LIBRARY = {
  math: "Can you explain quadratic equations and how to solve them using different methods?",
  science: "Could you help me understand Newton's laws of motion with examples relevant to everyday situations?",
  writing: "I need help structuring a persuasive essay for my English assignment. What are the key components?",
  study: "What are some effective study techniques for preparing for final exams?",
  exam: "Can you give me tips on how to manage time during examinations?",
  language: "How can I improve my reading comprehension skills for longer passages?"
};*/

// Use guided prompt
function usePrompt(category) {
  const input = document.getElementById('tutorInput');
  const prompt = PROMPT_LIBRARY[category];
  
  if (prompt) {
    input.value = prompt;
    input.focus();
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
  chatBox.innerHTML += `<div class="typing-indicator" id="typingIndicator">AI Tutor is thinking...</div>`;
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
