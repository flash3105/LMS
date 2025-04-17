function renderCalendarTab(contentArea) {
    contentArea.innerHTML = `
      <div class="welcome">
        <h2 class="fw-bold">Calendar</h2>
        <p class="text-muted">Stay on top of your schedule.</p>
      </div>
      <div class="calendar-section">
        <h3>April 2025</h3>
        <iframe src="https://calendar.google.com/calendar/embed?src=en.za%23holiday%40group.v.calendar.google.com&ctz=Africa%2FJohannesburg" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>
      </div>
    `;
  }