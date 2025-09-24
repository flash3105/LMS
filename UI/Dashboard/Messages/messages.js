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
/* Mobile-specific styles */
@media (max-width: 768px) {
  .messages-container {
    padding: 1rem;
  }
  
  .messages-layout {
    flex-direction: column;
    height: auto;
  }

  .conversations-list {
    flex: 0 0 auto;
    width: 100%;
    max-height: 40vh;
    margin-bottom: 1rem;
    border-radius: 12px;
  }

  .message-view {
    min-height: 50vh;
    border-radius: 12px;
  }

  .message {
    max-width: 85%;
  }

  .message-input-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  .message-input, .send-btn {
    width: 100%;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .conversation-item {
    padding: 0.75rem;
  }
  
  .conversation-details {
    min-width: 0; /* Allows text truncation */
  }
  
  .conversation-preview {
    font-size: 0.8rem;
  }
  
  .conversation-time {
    font-size: 0.7rem;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }
  
  .message-header {
    padding: 1rem;
    position: sticky;
    top: 0;
    background: white;
    z-index: 5;
  }
  
  .messages-container-inner {
    padding: 0.5rem;
  }
  
  .contacts-modal {
    border-radius: 0;
  }
}

/* Mobile container for messages */
.mobile-messages-container {
  display: none;
  min-height: 100vh;
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
}

.mobile-messages-header {
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  padding: 16px;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.mobile-messages-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mobile-messages-title {
  font-size: 20px;
  font-weight: 600;
}

.mobile-new-convo-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.mobile-messages-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.mobile-messages-content {
  padding: 16px;
}

.mobile-conversations-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.mobile-conversation-search {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
}

.mobile-search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
}

.mobile-conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
}

.mobile-conversation-item:last-child {
  border-bottom: none;
}

.mobile-conversation-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
}

.mobile-conversation-details {
  flex: 1;
  min-width: 0;
}

.mobile-conversation-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  font-size: 15px;
}

.mobile-conversation-preview {
  color: #718096;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-conversation-time {
  color: #a0aec0;
  font-size: 12px;
  margin-left: 8px;
  flex-shrink: 0;
}

.mobile-conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

/* Message view styles for mobile */
.mobile-message-view {
  display: none;
  flex-direction: column;
  height: 100vh;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.mobile-message-header {
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.mobile-back-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.mobile-recipient-info {
  flex: 1;
}

.mobile-recipient-name {
  font-weight: 600;
  font-size: 16px;
}

.mobile-recipient-status {
  font-size: 12px;
  opacity: 0.8;
}

.mobile-messages-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f0f4f8;
}

.mobile-message {
  max-width: 85%;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  font-size: 14px;
}

.mobile-message.received {
  background: white;
  border: 1px solid #e2e8f0;
  margin-right: auto;
}

.mobile-message.sent {
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  color: white;
  margin-left: auto;
}

.mobile-message-time {
  font-size: 11px;
  margin-top: 4px;
  text-align: right;
  opacity: 0.8;
}

.mobile-message-input-container {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  background: white;
  position: sticky;
  bottom: 0;
}

.mobile-message-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
}

.mobile-send-btn {
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

/* Contacts modal for mobile */
.mobile-contacts-modal {
  display: none;
  flex-direction: column;
  height: 100vh;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.mobile-contacts-header {
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  padding: 16px;
  color: white;
  display: flex;
  align-items: center;
}

.mobile-contacts-back {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.mobile-contacts-title {
  font-weight: 600;
  font-size: 18px;
}

.mobile-contacts-search {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.mobile-contacts-list {
  flex: 1;
  overflow-y: auto;
}

.mobile-contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
}

.mobile-contact-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(125, 152, 173) 0%, #3182ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
}

.mobile-contact-details {
  flex: 1;
}

.mobile-contact-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  font-size: 15px;
}

.mobile-contact-email {
  color: #718096;
  font-size: 13px;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .messages-container {
    display: none;
  }
  
  .mobile-messages-container {
    display: block;
  }
}

@media (min-width: 769px) {
  .mobile-messages-container {
    display: none;
  }
}

/* Original desktop styles */
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
  transition: background 0.2s;
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
  flex-shrink: 0;
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
  min-height: 50vh;
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
  word-wrap: break-word;
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
  transition: opacity 0.2s;
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
  background-color: 'none';
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
`;
document.head.appendChild(style);
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
      <!-- Desktop View -->
      <div class="messages-container">
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
      
      <!-- Mobile View -->
      <div class="mobile-messages-container">
        <div class="mobile-messages-header">
          <div class="mobile-messages-header-top">
            <div class="mobile-messages-title">Messages</div>
            <button class="mobile-new-convo-btn">+</button>
          </div>
          <div class="mobile-messages-subtitle">Stay connected with instructors and peers</div>
        </div>
        
        <div class="mobile-messages-content">
          <div class="mobile-conversations-list">
            <div class="mobile-conversation-search">
              <input type="text" class="mobile-search-input" placeholder="Search conversations...">
            </div>
            <div class="mobile-conversations-container">
              ${conversations.length > 0 ? 
                conversations.map(conv => renderMobileConversationItem(conv, currentUserEmail)).join('') : 
                '<div style="padding: 2rem; text-align: center; color: #718096;">No conversations yet</div>'
              }
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Message View (hidden by default) -->
      <div class="mobile-message-view">
        <div class="mobile-message-header">
          <button class="mobile-back-button">←</button>
          <div class="mobile-recipient-info">
            <div class="mobile-recipient-name">Select a conversation</div>
            <div class="mobile-recipient-status">Online</div>
          </div>
        </div>
        <div class="mobile-messages-list">
          <div style="text-align: center; padding: 2rem; color: #718096;">
            Select a conversation to view messages
          </div>
        </div>
        <div class="mobile-message-input-container">
          <input type="text" class="mobile-message-input" placeholder="Type a message...">
          <button class="mobile-send-btn">Send</button>
        </div>
      </div>
      
      <!-- Mobile Contacts Modal (hidden by default) -->
      <div class="mobile-contacts-modal">
        <div class="mobile-contacts-header">
          <button class="mobile-contacts-back">←</button>
          <div class="mobile-contacts-title">New Conversation</div>
        </div>
        <div class="mobile-contacts-search">
          <input type="text" class="mobile-search-input" placeholder="Search contacts...">
        </div>
        <div class="mobile-contacts-list">
          ${users.length > 0 ? 
            users.filter(user => user.email !== currentUserEmail)
              .map(user => `
                <div class="mobile-contact-item" data-email="${user.email}">
                  <div class="mobile-contact-avatar">${getInitials(user.name || user.email)}</div>
                  <div class="mobile-contact-details">
                    <div class="mobile-contact-name">${user.name || 'Unknown User'}</div>
                    <div class="mobile-contact-email">${user.email}</div>
                  </div>
                </div>
              `).join('') : 
            '<div style="padding: 2rem; text-align: center; color: #718096;">No contacts available</div>'
          }
        </div>
      </div>
    `;

    // Add event listeners for desktop
    const newConversationBtn = contentArea.querySelector('.new-conversation-btn');
    newConversationBtn.addEventListener('click', () => {
      showContactsModal(contentArea, users, currentUserEmail);
    });
    
    // Add click handlers for desktop conversation items
    contentArea.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', function() {
        const email = this.getAttribute('data-email');
        const conversation = conversations.find(c => c.participantEmail === email);
        if (conversation) {
          renderConversationView(contentArea, conversation, currentUserEmail);
        }
      });
    });
    
    // Add search functionality for desktop
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
    
    // Add event listeners for mobile
    const mobileNewConvoBtn = contentArea.querySelector('.mobile-new-convo-btn');
    mobileNewConvoBtn.addEventListener('click', () => {
      contentArea.querySelector('.mobile-contacts-modal').style.display = 'flex';
    });
    
    // Add click handlers for mobile conversation items
    contentArea.querySelectorAll('.mobile-conversation-item').forEach(item => {
      item.addEventListener('click', function() {
        const email = this.getAttribute('data-email');
        const conversation = conversations.find(c => c.participantEmail === email);
        if (conversation) {
          renderMobileConversationView(contentArea, conversation, currentUserEmail);
        }
      });
    });
    
    // Mobile back button from message view
    const mobileBackButton = contentArea.querySelector('.mobile-back-button');
    mobileBackButton.addEventListener('click', () => {
      contentArea.querySelector('.mobile-message-view').style.display = 'none';
      contentArea.querySelector('.mobile-messages-container').style.display = 'block';
    });
    
    // Mobile contacts back button
    const mobileContactsBack = contentArea.querySelector('.mobile-contacts-back');
    mobileContactsBack.addEventListener('click', () => {
      contentArea.querySelector('.mobile-contacts-modal').style.display = 'none';
    });
    
    // Mobile contact selection
    contentArea.querySelectorAll('.mobile-contact-item').forEach(item => {
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
          
          renderMobileConversationView(contentArea, newConversation, currentUserEmail);
          contentArea.querySelector('.mobile-contacts-modal').style.display = 'none';
        }
      });
    });
    
    // Mobile search functionality
    const mobileSearchInput = contentArea.querySelector('.mobile-search-input');
    mobileSearchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      contentArea.querySelectorAll('.mobile-conversation-item').forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        const email = item.getAttribute('data-email').toLowerCase();
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
    
    // Mobile contacts search
    const mobileContactsSearch = contentArea.querySelector('.mobile-contacts-modal .mobile-search-input');
    if (mobileContactsSearch) {
      mobileContactsSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        contentArea.querySelectorAll('.mobile-contact-item').forEach(item => {
          const name = item.querySelector('.mobile-contact-name').textContent.toLowerCase();
          const email = item.querySelector('.mobile-contact-email').textContent.toLowerCase();
          if (name.includes(searchTerm) || email.includes(searchTerm)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
    
    // Mobile send message handler
    const mobileSendBtn = contentArea.querySelector('.mobile-send-btn');
    const mobileMessageInput = contentArea.querySelector('.mobile-message-input');
    
    const mobileSendHandler = () => {
      const content = mobileMessageInput.value.trim();
      const recipient = mobileMessageInput.getAttribute('data-recipient');
      
      if (content && recipient) {
        sendQuickMessage(currentUserEmail, recipient, content, contentArea);
        mobileMessageInput.value = '';
      }
    };
    
    mobileSendBtn.addEventListener('click', mobileSendHandler);
    mobileMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        mobileSendHandler();
      }
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

// Render a mobile conversation list item
function renderMobileConversationItem(conversation, currentUserEmail) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const lastMessageText = lastMessage ? (lastMessage.content || '(No content)') : 'Start a conversation';
  const lastMessageTime = lastMessage ? formatTime(new Date(lastMessage.date)) : '';
  const initials = getInitials(conversation.participantName || conversation.participantEmail);
  
  return `
    <div class="mobile-conversation-item" data-email="${conversation.participantEmail}" data-name="${conversation.participantName}">
      <div class="mobile-conversation-avatar">${initials}</div>
      <div class="mobile-conversation-details">
        <div class="mobile-conversation-header">
          <div class="mobile-conversation-name">${conversation.participantName}</div>
          ${lastMessageTime ? `<div class="mobile-conversation-time">${lastMessageTime}</div>` : ''}
        </div>
        <div class="mobile-conversation-preview">${lastMessageText}</div>
      </div>
    </div>
  `;
}

// Render mobile conversation view
function renderMobileConversationView(contentArea, conversation, currentUserEmail) {
  const mobileMessageView = contentArea.querySelector('.mobile-message-view');
  const mobileMessagesContainer = contentArea.querySelector('.mobile-messages-container');
  const initials = getInitials(conversation.participantName || conversation.participantEmail);
  
  mobileMessageView.innerHTML = `
    <div class="mobile-message-header">
      <button class="mobile-back-button">←</button>
      <div class="mobile-recipient-info">
        <div class="mobile-recipient-name">${conversation.participantName}</div>
        <div class="mobile-recipient-status">Online</div>
      </div>
    </div>
    <div class="mobile-messages-list">
      ${conversation.messages.length > 0 ? 
        conversation.messages.map(msg => renderMobileMessageBubble(msg, currentUserEmail)).join('') : 
        '<div style="text-align: center; padding: 2rem; color: #718096;">No messages yet. Start the conversation!</div>'
      }
    </div>
    <div class="mobile-message-input-container">
      <input type="text" class="mobile-message-input" placeholder="Type a message..." data-recipient="${conversation.participantEmail}">
      <button class="mobile-send-btn">Send</button>
    </div>
  `;
  
  // Show the message view and hide the conversations list
  mobileMessagesContainer.style.display = 'none';
  mobileMessageView.style.display = 'flex';
  
  // Scroll to bottom of messages if there are any
  if (conversation.messages.length > 0) {
    const messagesContainer = mobileMessageView.querySelector('.mobile-messages-list');
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
  
  // Add back button handler
  const backButton = mobileMessageView.querySelector('.mobile-back-button');
  backButton.addEventListener('click', () => {
    mobileMessageView.style.display = 'none';
    mobileMessagesContainer.style.display = 'block';
  });
  
  // Add send message handler
  const messageInput = mobileMessageView.querySelector('.mobile-message-input');
  const sendButton = mobileMessageView.querySelector('.mobile-send-btn');
  
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

// Render a mobile message bubble
function renderMobileMessageBubble(message, currentUserEmail) {
  const isSent = message.sender === currentUserEmail;
  const time = formatTime(new Date(message.date));
  
  return `
    <div class="mobile-message ${isSent ? 'sent' : 'received'}">
      <div class="message-content">${message.content || '(No content)'}</div>
      <div class="mobile-message-time">${time}</div>
    </div>
  `;
}



