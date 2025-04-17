function renderCourseCard(course, isEnrolled, progress = 0) {
  return `
    <div class="course-card" onclick="goToCourse('${course.title}')">
      <h5>${course.title}</h5>
      <p>${course.description}</p>
      ${isEnrolled ? `
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <p>${progress}% Complete</p>
      ` : `
        <button class="btn btn-success btn-sm enrol-button" onclick="event.stopPropagation(); enrolInCourse('${course.title}')">
          Enrol
        </button>
      `}
    </div>
  `;
}