import { renderadminLearning } from './AdminLearning.js';

// Component: Quick Links
function renderQuickLinks() {
    return `
        <div class="quick-links">
            <h2>Quick Links</h2>
            <ul>
                <li><a href="#" id="viewUsersLink">View All Users</a></li>
                <li><a href="#" id="manageCoursesLink">Manage Courses</a></li>
                <li><a href="#" id="viewReportsLink">View Reports</a></li>
            </ul>
        </div>
    `;
}

// Component: Statistics
function renderStatistics() {
    return `
        <div class="statistics">
            <h2>Dashboard Statistics</h2>
            <p>Total Users: 120</p>
            <p>Active Courses: 15</p>
            <p>Pending Assessments: 8</p>
        </div>
    `;
}

// Component: Announcements
function renderAnnouncements() {
    return `
        <div class="announcements">
            <h2>Announcements</h2>
            <ul>
                <li>System maintenance scheduled for April 30th.</li>
                <li>New course templates available in the library.</li>
                <li>Reminder: Submit monthly reports by April 25th.</li>
            </ul>
        </div>
    `;
}

// Component: Recent Activity
function renderRecentActivity() {
    return `
        <div class="recent-activity">
            <h2>Recent Activity</h2>
            <ul>
                <li>John Doe enrolled in "JavaScript Basics".</li>
                <li>New course "Advanced Python" added by Admin.</li>
                <li>Assessment "Midterm Exam" graded for 20 students.</li>
            </ul>
        </div>
    `;
}

// Main Function: Render Home Tab
export function renderHomeTab(container, user) {
    container.innerHTML = `
        <div id="homeContent">
            <h1>Welcome, ${user.name}!</h1>
            <p>Email: ${user.email}</p>
            ${renderQuickLinks()}
            ${renderStatistics()}
            ${renderAnnouncements()}
            ${renderRecentActivity()}
        </div>
    `;

    // Render additional content in the content area
    renderadminLearning(document.getElementById('contentArea'));
}