import { fetchCourses, fetchUserData, fetchMessages, courses, userData, messages } from '../Data/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userId = JSON.parse(localStorage.getItem('user')).id; // Get user ID from localStorage

  await fetchCourses(); // Fetch courses
  await fetchUserData(userId); // Fetch user data
  await fetchMessages(userId); // Fetch messages

  console.log('Courses:', courses);
  console.log('User Data:', userData);
  console.log('Messages:', messages);
});

export function renderHomeTab(contentArea, currentUser) {
  // Safely access userProgress
  const userProgress = userData[currentUser.email] || {
    enrolledCourses: [],
    completedCourses: [],
    courseProgress: {},
  };

  // Filter enrolled courses
  const enrolledCourses = courses.filter(course =>
    userProgress.enrolledCourses.includes(course.title)
  );

  // Get recent messages
  const recentMessages = messages.slice(0, 2); // Show only the latest 2 messages

  // Render the content
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Welcome to your LMS Dashboard, ${currentUser.name}! 👋</h2>
      <p class="text-muted">Track your learning, manage your tasks, and stay up to date.</p>
    </div>
    <div class="home-section">
      <div class="ongoing-courses">
        <h2>Ongoing Courses</h2>
        <div class="grid">
          ${
            enrolledCourses.length > 0
              ? enrolledCourses
                  .map(
                    course => `
              <div class="card" onclick="goToCourse('${course.title}')">
                <h3>${course.title}</h3>
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${
                    userProgress.courseProgress[course.title] || 0
                  }%"></div>
                </div>
                <div class="info">${
                  userProgress.courseProgress[course.title] || 0
                }% Complete • ${Math.floor(
                  (userProgress.courseProgress[course.title] || 0) / 20
                )} hrs spent</div>
                <a href="#" class="continue-btn" onclick="event.preventDefault(); goToCourse('${course.title}')">Continue</a>
              </div>
            `
                  )
                  .join('')
              : '<p>No ongoing courses. Enroll in a course to get started!</p>'
          }
        </div>
      </div>
      <div class="enrolled-courses">
        <h2>Enrolled Courses</h2>
        <div class="card-container">
          ${
            enrolledCourses.length > 0
              ? enrolledCourses
                  .map(
                    course => `
              <div class="course-card" onclick="goToCourse('${course.title}')">
                <h5>${course.title}</h5>
                <p>${course.description}</p>
              </div>
            `
                  )
                  .join('')
              : '<p>You haven’t enrolled in any courses yet.</p>'
          }
        </div>
      </div>
      <div class="statistics">
        <h2>Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Courses Enrolled</h4>
            <p>${userProgress.enrolledCourses.length}</p>
          </div>
          <div class="stat-card">
            <h4>Courses Completed</h4>
            <p>${userProgress.completedCourses.length}</p>
          </div>
          <div class="stat-card">
            <h4>Assessments Due</h4>
            <p>${
              enrolledCourses.flatMap(course =>
                course.assessments.filter(a => a.status === 'Upcoming')
              ).length
            }</p>
          </div>
        </div>
      </div>
      <div class="recent-messages">
        <h2>Recent Messages</h2>
        ${
          recentMessages.length > 0
            ? recentMessages
                .map(
                  message => `
            <div class="message-preview">
              <h5>${message.sender}: ${message.subject}</h5>
              <p>${message.content}</p>
              <small>${message.date}</small>
            </div>
          `
                )
                .join('')
            : '<p>No recent messages.</p>'
        }
      </div>
    </div>
  `;
}