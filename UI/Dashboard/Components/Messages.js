export function renderMessage(message) {
  return `
    <div class="message-item">
      <h5>${message.sender}: ${message.subject}</h5>
      <p>${message.content}</p>
      <small>${message.date}</small>
    </div>
  `;
}