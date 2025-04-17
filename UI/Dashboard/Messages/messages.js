export function renderMessagesTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Messages</h2>
      <p class="text-muted">Stay connected with instructors.</p>
    </div>
    <div class="messages-section">
      <h3>Inbox</h3>
      ${messages.map(renderMessage).join('')}
      <h3>Send a Message</h3>
      <form class="message-form" onsubmit="sendMessage(event)">
        <textarea placeholder="Write your message here..." required></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
}

function sendMessage(event) {
    event.preventDefault();
    const content = event.target.querySelector("textarea").value;
    messages.push({
      id: messages.length + 1,
      sender: currentUser.name,
      subject: content.substring(0, 20) + "...",
      content,
      date: new Date().toISOString().split("T")[0]
    });
    localStorage.setItem("messages", JSON.stringify(messages));
    renderMessagesTab(document.getElementById("contentArea"));
  }