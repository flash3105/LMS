import { fetchAllAssessments } from '../Data/data.js';
export async function renderCalendarTab(contentArea) {
  contentArea.innerHTML = `
    <style>
      .calendar-container {
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
        color:rgb(26, 115, 150);
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .welcome p {
        color:rgb(39, 106, 177);
        font-size: 1.1rem;
      }
      
      .calendar-section {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 2rem;
      }
      
      #calendar {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        --fc-border-color: #e2e8f0;
        --fc-neutral-bg-color: #f7fafc;
      }
      
      /* Header Toolbar */
      .fc-header-toolbar {
        margin-bottom: 1.5rem !important;
        flex-direction: column;
        gap: 1rem;
      }
      
      @media (min-width: 768px) {
        .fc-header-toolbar {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }
      
      .fc-toolbar-title {
        color: #2d3748;
        font-size: 1.5rem !important;
        font-weight: 600;
        order: 1;
        margin: 0 1rem !important;
      }
      
      .fc-toolbar-chunk {
        display: flex;
        gap: 0.75rem !important; /* Increased gap between buttons */
        align-items: center;
      }
      
      /* Navigation buttons spacing */
      .fc-prev-button, .fc-next-button {
        margin: 0 0.5rem !important; /* Space between prev/next and today */
      }
      
      .fc-today-button {
        margin: 0 0.5rem !important; /* Space around today button */
      }
      
      /* View buttons spacing */
      .fc-dayGridMonth-button, 
      .fc-timeGridWeek-button, 
      .fc-timeGridDay-button {
        margin: 0 0.25rem !important; /* Space between view buttons */
      }
      
      /* Buttons */
      .fc-button {
        background: #4299e1 !important;
        border: none !important;
        color: white !important;
        text-transform: capitalize !important;
        border-radius: 6px !important;
        padding: 0.5rem 1rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        margin: 0 0.25rem !important; /* General button spacing */
      }
      
      .fc-button:hover {
        background: #3182ce !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
      
      .fc-button:active {
        transform: translateY(0) !important;
      }
      
      .fc-button-primary:not(:disabled).fc-button-active {
        background: #2b6cb0 !important;
      }
      
      /* Specific spacing for navigation groups */
      .fc-header-toolbar .fc-toolbar-chunk:first-child {
        gap: 0.5rem !important; /* Space between prev, next, today */
      }
      
      .fc-header-toolbar .fc-toolbar-chunk:last-child {
        gap: 0.5rem !important; /* Space between view buttons */
      }
      
      /* Column Headers */
      .fc-col-header-cell {
        background: #f8fafc !important;
        color: #4a5568 !important;
        font-weight: 600 !important;
        padding: 0.75rem 0 !important;
        border: none !important;
      }
      
      .fc-col-header-cell.fc-day-today {
        background: #ebf8ff !important;
      }
      
      /* Day Cells */
      .fc-daygrid-day {
        transition: background 0.2s;
      }
      
      .fc-daygrid-day:hover {
        background: #f8fafc !important;
      }
      
      .fc-daygrid-day.fc-day-today {
        background-color: #ebf8ff !important;
      }
      
      .fc-daygrid-day-number {
        color: #2d3748;
        font-weight: 500;
        padding: 0.5rem;
        font-size: 0.9rem;
      }
      
      .fc-day-today .fc-daygrid-day-number {
        color: #3182ce;
        font-weight: 600;
      }
      
      /* Events */
      .fc-daygrid-event {
        background: #4299e1 !important;
        border: none !important;
        border-radius: 6px !important;
        padding: 0.25rem 0.5rem !important;
        margin: 0.1rem 0.25rem !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s;
      }
      
      .fc-daygrid-event:hover {
        background: #3182ce !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .fc-event-title {
        font-weight: 500;
      }
      
      /* Week and Day Views */
      .fc-timegrid-slots td {
        border-color: #e2e8f0 !important;
      }
      
      .fc-timegrid-axis {
        background: #f8fafc;
      }
      
      .fc-timegrid-slot-label-frame {
        color: #4a5568;
      }
      
      /* Empty State */
      .empty-state {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        color: #718096;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          margin: 0.5rem 0 !important;
        }
        
        .fc-button {
          padding: 0.4rem 0.6rem !important;
          font-size: 0.9rem !important;
          margin: 0.1rem !important;
        }
        
        .fc-header-toolbar {
          gap: 0.5rem !important;
        }
        
        .fc-toolbar-chunk {
          justify-content: center;
          width: 100%;
        }
        
        .fc-header-toolbar .fc-toolbar-chunk:nth-child(1),
        .fc-header-toolbar .fc-toolbar-chunk:nth-child(3) {
          order: 2;
        }
      }
    </style>

    
    <div class="calendar-container">
      <div class="welcome">
        <h2>Learning Calendar</h2>
        <p>Track your assessments, deadlines, and learning schedule</p>
      </div>
      
      <div class="calendar-section">
        <div id="calendar"></div>
      </div>
    </div>
  `;

  try {
    const calendarEl = document.getElementById('calendar');
    const events = await getCalendarEvents();
    
    const calendar = new window.FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      aspectRatio: 1.5,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      views: {
        dayGridMonth: {
          dayHeaderFormat: { weekday: 'short' },
          dayMaxEvents: 3,
          fixedWeekCount: false
        },
        timeGridWeek: {
          dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
        },
        timeGridDay: {
          dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
        }
      },
      events: events,
      eventClick: function(info) {
        const eventTime = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const eventDate = info.event.start.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const eventDetail = `
          <div style="padding: 1rem; color: #2d3748;">
            <div style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              margin-bottom: 1rem;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background: #4299e1;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
              ">
                ${info.event.start.getDate()}
              </div>
              <div>
                <div style="font-size: 0.9rem; color: #718096;">${eventDate}</div>
                <h3 style="margin: 0.25rem 0; font-size: 1.25rem;">${info.event.title}</h3>
                <div style="font-size: 0.9rem; color: #4299e1; font-weight: 500;">${eventTime}</div>
              </div>
            </div>
            <div style="
              background: #f7fafc;
              border-radius: 8px;
              padding: 1rem;
              margin-top: 1rem;
            ">
              <p style="margin: 0; color: #4a5568;">${info.event.extendedProps.description || 'No additional details provided'}</p>
            </div>
          </div>
        `;
        
        Swal.fire({
          html: eventDetail,
          showConfirmButton: true,
          showCloseButton: true,
          confirmButtonColor: '#4299e1',
          background: 'white',
          width: '500px',
          padding: '0',
          borderRadius: '12px',
          customClass: {
            closeButton: 'calendar-close-btn'
          }
        });
      },
      eventContent: function(arg) {
        const eventTime = arg.event.start ? 
          arg.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        return {
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              padding: 0.5rem;
            ">
              <div style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  background: white;
                  border-radius: 50%;
                  flex-shrink: 0;
                "></div>
                <div style="
                  font-weight: 500;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">${arg.event.title}</div>
              </div>
              ${eventTime ? `
                <div style="
                  font-size: 0.75rem;
                  color: rgba(255,255,255,0.8);
                  margin-top: 0.25rem;
                  margin-left: 1.25rem;
                ">${eventTime}</div>
              ` : ''}
            </div>
          `
        };
      },
      dayHeaderContent: function(arg) {
        return {
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
            ">
              <div style="
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #64748b;
              ">${arg.text.split(' ')[0]}</div>
              ${arg.text.split(' ')[1] ? `
                <div style="
                  font-size: 1rem;
                  font-weight: 600;
                  color: #334155;
                  margin-top: 0.25rem;
                ">${arg.text.split(' ')[1]}</div>
              ` : ''}
            </div>
          `
        };
      },
      eventDisplay: 'block',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      },
      nowIndicator: true,
      navLinks: true,
      editable: false,
      selectable: false,
      dayMaxEventRows: 3,
      handleWindowResize: true
    });
    
    calendar.render();
    
    // Add custom today indicator
    const todayIndicator = document.createElement('div');
    todayIndicator.style.position = 'absolute';
    todayIndicator.style.top = '0';
    todayIndicator.style.right = '0';
    todayIndicator.style.width = '0';
    todayIndicator.style.height = '0';
    todayIndicator.style.borderLeft = '8px solid transparent';
    todayIndicator.style.borderRight = '8px solid transparent';
    todayIndicator.style.borderTop = '8px solid #3182ce';
    todayIndicator.style.transform = 'translateY(-100%)';
    
    const todayCells = document.querySelectorAll('.fc-day-today');
    todayCells.forEach(cell => {
      const clone = todayIndicator.cloneNode(true);
      cell.appendChild(clone);
    });
    
  } catch (error) {
    console.error('Calendar initialization failed:', error);
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
      calendarEl.innerHTML = `
        <div class="empty-state">
          <p>Failed to load calendar. Please try again later.</p>
        </div>
      `;
    }
  }
}

async function getCalendarEvents() {
  try {
    const assessments = await fetchAllAssessments();
    return assessments.map(a => ({
      title: a.title,
      start: a.dueDate,
      extendedProps: {
        description: a.description || '',
        type: a.type || 'assessment'
      },
      classNames: [`event-type-${a.type || 'assessment'}`]
    }));
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return [];
  }
}