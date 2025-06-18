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

// Render the full Messages tab
export async function renderMessagesTab(contentArea) {
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
      <div class="welcome mb-4">
        <h2 class="fw-bold">Messages</h2>
        <p class="text-muted">Stay connected with instructors.</p>
      </div>

      <div class="messages-section">
        <h4>Inbox (Received Messages)</h4>
        ${receivedMessages.length ? renderGroupedMessages(groupedInbox, 'From') : '<div class="alert alert-info">No messages received.</div>'}

        <h4 class="mt-4">Sent Messages</h4>
        ${sentMessages.length ? renderGroupedMessages(groupedSent, 'To') : '<div class="alert alert-info">No messages sent.</div>'}

        <h4 class="mt-4">Send a Message</h4>
        <form class="message-form mt-3">
          <select class="form-select email-dropdown mb-2" required>
            <option value="" disabled selected>Select recipient email</option>
            ${emails.map(email => `<option value="${email}">${email}</option>`).join('')}
          </select>
          <textarea class="form-control mb-2" placeholder="Write your message here..." required></textarea>
          <button type="submit" class="btn btn-primary">Send</button>
        </form>
      </div>
    `;

    // Attach event listener
    contentArea.querySelector('.message-form').addEventListener('submit', sendMessage);
  } catch (error) {
    console.error('Error loading messages:', error);
    contentArea.innerHTML = `
      <div class="alert alert-danger">Failed to load messages: ${error.message}</div>
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
  const dateFormatted = new Date(message.date).toLocaleString();
  return `
    <div class="message-item border p-3 mb-2 rounded shadow-sm">
      <div class="message-header d-flex justify-content-between">
        <small class="text-muted">${dateFormatted}</small>
      </div>
      <div class="message-subject fw-semibold">${message.subject || '(No subject)'}</div>
      <div class="message-content mt-1">${message.content || '(No content)'}</div>
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
    <div class="grouped-message mb-4">
      <h6 class="fw-bold">${label}: ${user}</h6>
      ${msgs.map(renderMessage).join('')}
    </div>
  `).join('');
}
