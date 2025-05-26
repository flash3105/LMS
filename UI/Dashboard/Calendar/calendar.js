import { fetchAllAssessments } from '../Data/data.js';

export async function renderCalendarTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Calendar</h2>
      <p class="text-muted">Stay on top of your schedule.</p>
    </div>
    <div class="calendar-section">
      <div id="calendar"></div>
    </div>
  `;

  try {
    const calendarEl = document.getElementById('calendar');
    const events = await getCalendarEvents();
    const calendar = new window.FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 600,
      events: events,
      eventClick: function(info) {
        alert(`${info.event.title}\n${info.event.extendedProps.description || ''}`);
      }
    });
    calendar.render();
  } catch (error) {
    console.error('Calendar initialization failed:', error);
    // Optionally show a user-friendly error message in the UI
  }
}

async function getCalendarEvents() {
  try {
    const assessments = await fetchAllAssessments();
    return assessments.map(a => ({
      title: a.title,
      start: a.dueDate,
      extendedProps: {
        description: a.description || ''
      }
    }));
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return [];
  }
}