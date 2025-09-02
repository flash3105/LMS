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
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
    }
    
    .welcome {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    
    .welcome h2 {
      color: rgb(26, 115, 150);
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    
    .welcome p {
      color: rgb(39, 106, 177);
      font-size: 1.1rem;
    }
    
    .messages-layout {
      display: flex;
      gap: 1.5rem;
      height: 70vh;
    }
    
    .conversations-list {
      flex: 0 0 350px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
    }
    
    .conversations-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .conversations-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .new-conversation-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    .new-conversation-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .conversations-search {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
    }
    
    .conversations-container {
      flex: 1;
      overflow-y: auto;
    }
    
    .conversation-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #f1f3f4;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .conversation-item:hover {
      background-color: #f8fafc;
    }
    
    .conversation-item.active {
      background-color: #ebf5ff;
    }
    
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 1rem;
    }
    
    .conversation-details {
      flex: 1;
    }
    
    .conversation-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }
    
    .conversation-preview {
      color: #718096;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .conversation-time {
      color: #a0aec0;
      font-size: 0.8rem;
    }
    
    .message-view {
      flex: 1;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    
    .message-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
    }
    
    .message-header .avatar {
      margin-right: 1rem;
    }
    
    .message-recipient {
      font-weight: 600;
      color: #2d3748;
      flex: 1;
    }
    
    .messages-container-inner {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      background: #f0f4f8;
    }
    
    .message {
      max-width: 70%;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      position: relative;
    }
    
    .message.received {
      background: white;
      border: 1px solid #e2e8f0;
      margin-right: auto;
    }
    
    .message.sent {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      margin-left: auto;
    }
    
    .message-time {
      font-size: 0.7rem;
      margin-top: 0.25rem;
      text-align: right;
      opacity: 0.8;
    }
    
    .message-input-container {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 0.5rem;
    }
    
    .message-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      font-size: 1rem;
    }
    
    .send-btn {
      background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
      color: white;
      border: none;
      border-radius: 24px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      cursor: pointer;
    }
    
    .send-btn:hover {
      opacity: 0.9;
    }
    
    .empty-conversation {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #a0aec0;
      text-align: center;
    }
    
    .contacts-modal {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      z-index: 10;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
    }
    
    .contacts-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .back-button {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #4a5568;
    }
    
    .contacts-search {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .contacts-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .contact-item:hover {
      background-color: #f8fafc;
    }
    
    .contact-details {
      margin-left: 1rem;
    }
    
    .contact-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .contact-email {
      color: #718096;
      font-size: 0.9rem;
    }
    
    .no-contacts {
      padding: 2rem;
      text-align: center;
      color: #718096;
    }
    
    @media (max-width: 768px) {
      .messages-layout {
        flex-direction: column;
        height: auto;
      }
      
      .conversations-list {
        flex: 0 0 auto;
        height: 40vh;
      }
      
      .message {
        max-width: 85%;
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
    const users = Array.isArray(usersData.users) ? usersData.users : [];
    
    const receivedMessages = await fetchReceivedMessages(currentUserEmail);
    const sentMessages = await fetchSentMessages(currentUserEmail);
    
    // Combine and organize messages by conversation
    const allMessages = [...receivedMessages, ...sentMessages];
    const conversations = organizeConversations(allMessages, currentUserEmail, users);

    contentArea.innerHTML = `
      <div class="profile-container">
        <div class="welcome">
          <h2>Messages</h2>
          <p>Stay connected with instructors and peers</p>
        </div>
        
        <div class="messages-layout">
          <div class="conversations-list">
            <div class="conversations-header">
              <h3>Conversations</h3>
              <button class="new-conversation-btn" title="New conversation">+</button>
            </div>
            <div class="conversations-search">
              <input type="text" class="search-input" placeholder="Search conversations...">
            </div>
            <div class="conversations-container">
              ${conversations.length > 0 ? 
                conversations.map(conv => renderConversationItem(conv, currentUserEmail)).join('') : 
                '<div class="empty-state" style="padding: 2rem; text-align: center; color: #718096;">No conversations yet</div>'
              }
            </div>
          </div>
          
          <div class="message-view">
            <div class="empty-conversation">
              <div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to view messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const newConversationBtn = contentArea.querySelector('.new-conversation-btn');
    newConversationBtn.addEventListener('click', () => {
      showContactsModal(contentArea, users, currentUserEmail);
    });
    
    // Add click handlers for conversation items
    contentArea.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', function() {
        const email = this.getAttribute('data-email');
        const conversation = conversations.find(c => c.participantEmail === email);
        if (conversation) {
          renderConversationView(contentArea, conversation, currentUserEmail);
        }
      });
    });
    
    // Add search functionality
    const searchInput = contentArea.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      contentArea.querySelectorAll('.conversation-item').forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        const email = item.getAttribute('data-email').toLowerCase();
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading messages:', error);
    contentArea.innerHTML = `
      <div class="profile-container">
        <div class="welcome">
          <h2>Messages</h2>
          <p>Stay connected with instructors and peers</p>
        </div>
        <div class="alert alert-danger">Failed to load messages: ${error.message}</div>
      </div>
    `;
  }
}

// Show contacts modal for starting a new conversation
function showContactsModal(contentArea, users, currentUserEmail) {
  const messageView = contentArea.querySelector('.message-view');
  
  messageView.innerHTML = `
    <div class="contacts-modal">
      <div class="contacts-header">
        <button class="back-button">←</button>
        <h3 style="margin: 0;">New Conversation</h3>
      </div>
      <div class="contacts-search">
        <input type="text" class="search-input contacts-search-input" placeholder="Search contacts...">
      </div>
      <div class="contacts-container">
        ${users.length > 0 ? 
          users.filter(user => user.email !== currentUserEmail)
            .map(user => `
              <div class="contact-item" data-email="${user.email}">
                <div class="avatar">${getInitials(user.name || user.email)}</div>
                <div class="contact-details">
                  <div class="contact-name">${user.name || 'Unknown User'}</div>
                  <div class="contact-email">${user.email}</div>
                </div>
              </div>
            `).join('') : 
          '<div class="no-contacts">No contacts available</div>'
        }
      </div>
    </div>
  `;
  
  // Add back button handler
  const backButton = messageView.querySelector('.back-button');
  backButton.addEventListener('click', () => {
    renderMessagesTab(contentArea);
  });
  
  // Add contact selection handler
  messageView.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', function() {
      const email = this.getAttribute('data-email');
      const user = users.find(u => u.email === email);
      
      if (user) {
        // Create a new conversation with this user
        const newConversation = {
          participantEmail: user.email,
          participantName: user.name || user.email,
          messages: [],
          lastMessageTime: new Date()
        };
        
        renderConversationView(contentArea, newConversation, currentUserEmail);
      }
    });
  });
  
  // Add search functionality for contacts
  const searchInput = messageView.querySelector('.contacts-search-input');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    messageView.querySelectorAll('.contact-item').forEach(item => {
      const name = item.querySelector('.contact-name').textContent.toLowerCase();
      const email = item.querySelector('.contact-email').textContent.toLowerCase();
      if (name.includes(searchTerm) || email.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Organize messages into conversations
function organizeConversations(messages, currentUserEmail, users) {
  const conversationsMap = {};
  
  messages.forEach(message => {
    // Determine the other participant in the conversation
    const isFromCurrentUser = message.sender === currentUserEmail;
    const participantEmail = isFromCurrentUser ? message.recipient : message.sender;
    
    if (!conversationsMap[participantEmail]) {
      // Find user details if available
      const user = users.find(u => u.email === participantEmail) || { email: participantEmail };
      conversationsMap[participantEmail] = {
        participantEmail: participantEmail,
        participantName: user.name || participantEmail,
        messages: [],
        lastMessageTime: new Date(message.date)
      };
    }
    
    // Add the message to the conversation
    conversationsMap[participantEmail].messages.push({
      ...message,
      type: isFromCurrentUser ? 'sent' : 'received'
    });
    
    // Update last message time if this message is newer
    const messageTime = new Date(message.date);
    if (messageTime > conversationsMap[participantEmail].lastMessageTime) {
      conversationsMap[participantEmail].lastMessageTime = messageTime;
    }
  });
  
  // Convert to array and sort by last message time (newest first)
  return Object.values(conversationsMap).sort((a, b) => 
    b.lastMessageTime - a.lastMessageTime
  );
}

// Render a conversation list item
function renderConversationItem(conversation, currentUserEmail) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const lastMessageText = lastMessage ? (lastMessage.content || '(No content)') : 'Start a conversation';
  const lastMessageTime = lastMessage ? formatTime(new Date(lastMessage.date)) : '';
  const initials = getInitials(conversation.participantName || conversation.participantEmail);
  
  return `
    <div class="conversation-item" data-email="${conversation.participantEmail}" data-name="${conversation.participantName}">
      <div class="avatar">${initials}</div>
      <div class="conversation-details">
        <div class="conversation-name">${conversation.participantName}</div>
        <div class="conversation-preview">${lastMessageText}</div>
      </div>
      ${lastMessageTime ? `<div class="conversation-time">${lastMessageTime}</div>` : ''}
    </div>
  `;
}

// Render the conversation view
function renderConversationView(contentArea, conversation, currentUserEmail) {
  const messageView = contentArea.querySelector('.message-view');
  const initials = getInitials(conversation.participantName || conversation.participantEmail);
  
  messageView.innerHTML = `
    <div class="message-header">
      <div class="avatar">${initials}</div>
      <div class="message-recipient">${conversation.participantName}</div>
    </div>
    <div class="messages-container-inner">
      ${conversation.messages.length > 0 ? 
        conversation.messages.map(msg => renderMessageBubble(msg, currentUserEmail)).join('') : 
        '<div style="text-align: center; padding: 2rem; color: #718096;">No messages yet. Start the conversation!</div>'
      }
    </div>
    <div class="message-input-container">
      <input type="text" class="message-input" placeholder="Type a message..." data-recipient="${conversation.participantEmail}">
      <button class="send-btn">Send</button>
    </div>
  `;
  
  // Scroll to bottom of messages if there are any
  if (conversation.messages.length > 0) {
    const messagesContainer = messageView.querySelector('.messages-container-inner');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Add send message handler
  const messageInput = messageView.querySelector('.message-input');
  const sendButton = messageView.querySelector('.send-btn');
  
  const sendHandler = () => {
    const content = messageInput.value.trim();
    if (content) {
      sendQuickMessage(currentUserEmail, conversation.participantEmail, content, contentArea);
      messageInput.value = '';
    }
  };
  
  sendButton.addEventListener('click', sendHandler);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendHandler();
    }
  });
}

// Render a message bubble
function renderMessageBubble(message, currentUserEmail) {
  const isSent = message.sender === currentUserEmail;
  const time = formatTime(new Date(message.date));
  
  return `
    <div class="message ${isSent ? 'sent' : 'received'}">
      <div class="message-content">${message.content || '(No content)'}</div>
      <div class="message-time">${time}</div>
    </div>
  `;
}

// Handle sending message from the quick input
async function sendQuickMessage(sender, recipient, content, contentArea) {
  const subject = content.length > 20 ? content.substring(0, 20) + "..." : content;

  try {
    const newMessage = await sendMessageToAPI(sender, recipient, subject, content);
    console.log('Message sent successfully:', newMessage);
    
    // Refresh the messages view
    renderMessagesTab(contentArea);
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}

// Helper function to format time
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    return Math.floor(diff / 60000) + 'm ago';
  } else if (diff < 86400000) { // Less than 1 day
    return Math.floor(diff / 3600000) + 'h ago';
  } else if (diff < 604800000) { // Less than 1 week
    return Math.floor(diff / 86400000) + 'd ago';
  } else {
    return date.toLocaleDateString();
  }
}

// Helper function to get initials from a name
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}