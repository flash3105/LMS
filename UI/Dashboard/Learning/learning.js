export function renderLearningTab(contentArea) {
  contentArea.innerHTML = `
    <div class="welcome">
      <h2 class="fw-bold">Learning Dashboard</h2>
      <p class="text-muted">Explore your courses and track your learning journey below.</p>
    </div>
    <div class="section-title">Available Courses</div>
    <div class="card-container" id="courseContainer"></div>
  `;

  // Fetch and render courses
  fetchCourses();
}

function renderCourses(courseList) {
    const container = document.getElementById("courseContainer");
    if (!container) return;
    container.innerHTML = "";
    courseList.forEach(course => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <h5>${course.title}</h5>
        <p>${course.description}</p>
        <button class="btn btn-success btn-sm enrol-button" onclick="event.stopPropagation(); enrolInCourse('${course.title}')">
          ${userData[currentUser.email].enrolledCourses.includes(course.title) ? 'Enrolled' : 'Enrol'}
        </button>
      `;
      card.addEventListener("click", () => {
        isCourseDetailsView = true;
        currentCourse = course;
        renderCourseDetails(document.getElementById("contentArea"), course);
      });
      container.appendChild(card);
    });
  }