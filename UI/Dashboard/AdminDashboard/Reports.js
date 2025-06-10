const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

export async function renderReports(container) {
  container.innerHTML = `
    <div class="reports-container">
      <h2>Analytics & Reports</h2>
      <div id="analyticsTableArea">
        <p>Loading analytics...</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    const analytics = await response.json();

    if (!analytics.length) {
      document.getElementById('analyticsTableArea').innerHTML = '<p>No analytics data available.</p>';
      return;
    }

    document.getElementById('analyticsTableArea').innerHTML = `
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Course</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Quiz</th>
            <th>Grade</th>
            <th>Time Spent (s)</th>
          </tr>
        </thead>
        <tbody>
          ${analytics.map(a => `
            <tr>
              <td>${a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
              <td>${a.userId || '-'}</td>
              <td>${a.courseId || '-'}</td>
              <td>${a.action}</td>
              <td>${a.resourceTitle ? a.resourceTitle : (a.resourceUrl ? `<a href="${a.resourceUrl}" target="_blank">Link</a>` : '-')}</td>
              <td>${a.quizId || '-'}</td>
              <td>${a.grade !== undefined ? a.grade : '-'}</td>
              <td>${a.seconds !== undefined ? a.seconds : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById('analyticsTableArea').innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
}