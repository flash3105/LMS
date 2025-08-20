let messages = [];
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Fetch received messages from the API
async function fetchReceivedMessages(recipient) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/receive/${recipient}`);
    if (!response.ok) throw new Error('Failed to fetch received messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching received messages:', error);
    return [];
  }
}

// Fetch sent messages from the API
async function fetchSentMessages(sender) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/sent/${sender}`);
    if (!response.ok) throw new Error('Failed to fetch sent messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return [];
  }
}

// Send a message using the API
async function sendMessageToAPI(sender, recipient, subject, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, recipient, subject, content })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Load CSS for messages tab
function loadMessagesCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .messages-container {
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
    
    .messages-section {
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
    
    .message-group {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3182ce;
    }
    
    .group-header {
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    .message-item {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #e9ecef;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .message-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .message-date {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .message-subject {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .message-content {
      color: #495057;
      line-height: 1.6;
      margin-bottom: 0;
    }
    
    .message-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solidrgb(48, 125, 173);
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-label {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .form-select, .form-control {
      border: 2px solid #e9ecef;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    
    .form-select:focus, .form-control:focus {
      border-color: #3182ce;
      box-shadow: 0 0 0 0.2rem rgba(49, 130, 206, 0.25);
    }
    
    .send-btn {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .send-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .empty-state {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      color: #6c757d;
      margin: 1rem 0;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
    
    .alert-info {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      color: #1565c0;
    }
    
    .alert-danger {
      background-color: #ffebee;
      border: 1px solid #ffcdd2;
      color: #c62828;
    }
    
    @media (max-width: 768px) {
      .messages-container {
        padding: 1rem;
      }
      
      .messages-section {
        padding: 1rem;
      }
      
      .message-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `;
  document.head.appendChild(style);
}

// Render the full Messages tab
export async function renderMessagesTab(contentArea) {
  loadMessagesCSS();
  
  try {
    const currentUserEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
    console.log('Current User Email:', currentUserEmail);
    if (!currentUserEmail) throw new Error("User email not found in localStorage");

    const usersResponse = await fetch(`${API_BASE_URL}/auth/registered-users`);
    if (!usersResponse.ok) throw new Error('Failed to fetch emails');
    const usersData = await usersResponse.json();
    const emails = Array.isArray(usersData.users) ? usersData.users.map(user => user.email) : [];

    const receivedMessages = await fetchReceivedMessages(currentUserEmail);
    const sentMessages = await fetchSentMessages(currentUserEmail);

    const groupedInbox = groupMessagesByUser(receivedMessages, 'sender');
    const groupedSent = groupMessagesByUser(sentMessages, 'recipient');

    contentArea.innerHTML = `


      <div class="profile-container">
        <div class="welcome">
          <h2>Messages</h2>
          <p>Stay connected with instructors and peers</p>
        </div>
        
        <div class="messages-section">
          <div class="section-title">Inbox (Received Messages)</div>
          ${receivedMessages.length ? renderGroupedMessages(groupedInbox, 'From') : '<div class="empty-state">No messages received yet.</div>'}

          <div class="section-title" style="margin-top: 2.5rem;">Sent Messages</div>
          ${sentMessages.length ? renderGroupedMessages(groupedSent, 'To') : '<div class="empty-state">No messages sent yet.</div>'}

          <div class="section-title" style="margin-top: 2.5rem;">Send a Message</div>
          <form class="message-form">
            <div class="form-group">
              <label class="form-label">Recipient</label>
              <select class="form-select email-dropdown" required>
                <option value="" disabled selected>Select recipient email</option>
                ${emails.map(email => `<option value="${email}">${email}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-control" placeholder="Write your message here..." rows="5" required></textarea>
            </div>
            <button type="submit" class="send-btn">Send Message</button>
          </form>
        </div>
      </div>
    `;

    // Attach event listener
    contentArea.querySelector('.message-form').addEventListener('submit', sendMessage);
  } catch (error) {
    console.error('Error loading messages:', error);
    contentArea.innerHTML = `
      <div class="messages-container">
        <div class="messages-header">
          <h2>Messages</h2>
          <p>Stay connected with instructors and peers</p>
        </div>
        <div class="alert alert-danger">Failed to load messages: ${error.message}</div>
      </div>
    `;
  }
}

// Handle sending message
async function sendMessage(event) {
  event.preventDefault();
  const form = event.target;
  const recipient = form.querySelector(".email-dropdown").value;
  const content = form.querySelector("textarea").value;

  const sender = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
  const subject = content.length > 20 ? content.substring(0, 20) + "..." : content;

  try {
    const newMessage = await sendMessageToAPI(sender, recipient, subject, content);
    console.log('Message sent successfully:', newMessage);
    messages.push(newMessage);
    renderMessagesTab(document.getElementById("contentArea")); // Refresh
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}

// Render a single message
function renderMessage(message) {
  const dateFormatted = new Date(message.date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <div class="message-item">
      <div class="message-header">
        <span class="message-date">${dateFormatted}</span>
      </div>
      <div class="message-subject">${message.subject || '(No subject)'}</div>
      <div class="message-content">${message.content || '(No content)'}</div>
    </div>
  `;
}

// Group messages by sender or recipient
function groupMessagesByUser(messages, key) {
  return messages.reduce((acc, msg) => {
    const groupKey = msg[key];
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(msg);
    return acc;
  }, {});
}

// Render grouped messages
function renderGroupedMessages(grouped, label) {
  return Object.entries(grouped).map(([user, msgs]) => `
    <div class="message-group">
      <div class="group-header">${label}: ${user}</div>
      ${msgs.map(renderMessage).join('')}
    </div>
  `).join('');
}