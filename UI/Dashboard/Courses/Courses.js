export function renderCourseDetails(contentArea, course) {
    const userProgress = userData[currentUser.email];
    const isEnrolled = userProgress.enrolledCourses.includes(course.title);
    const completedLessons = userProgress.completedLessons ? userProgress.completedLessons[course.title] || [] : [];
    const progress = userProgress.courseProgress ? userProgress.courseProgress[course.title] || 0 : 0;
  
    contentArea.innerHTML = `
      <button class="back-button" onclick="goBackToCourses()">Back to Courses</button>
      <div class="course-details">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        ${currentUser.role === "student" ? `
          <button class="enrol-button ${isEnrolled ? 'enrolled' : ''}" onclick="enrolInCourse('${course.title}')">
            ${isEnrolled ? 'Enrolled' : 'Enrol'}
          </button>
        ` : ''}
        ${isEnrolled ? `
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${progress}%"></div>
          </div>
          <h4>Lessons</h4>
          ${course.lessons.length > 0 ? course.lessons.map(lesson => `
            <div class="lesson-item ${completedLessons.includes(lesson.id) ? 'completed' : ''}">
              <div>
                <h5>${lesson.title}</h5>
                <p>${lesson.content}</p>
              </div>
              ${!completedLessons.includes(lesson.id) ? `
                <button onclick="completeLesson('${course.title}', ${lesson.id})">Complete</button>
              ` : '<span>Completed</span>'}
            </div>
          `).join('') : '<p>No lessons available.</p>'}
          <h4>Assessments</h4>
          <table class="assessments-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${course.assessments.length > 0 ? course.assessments.map(assessment => `
                <tr>
                  <td>${assessment.name}</td>
                  <td>${assessment.dueDate}</td>
                  <td>${assessment.status}</td>
                  <td>${assessment.grade || 'N/A'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4">No assessments available.</td></tr>'}
            </tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  
function enrolInCourse(courseTitle) {
    const userProgress = userData[currentUser.email];
    if (!userProgress.enrolledCourses.includes(courseTitle)) {
      userProgress.enrolledCourses.push(courseTitle);
      userProgress.courseProgress = userProgress.courseProgress || {};
      userProgress.courseProgress[courseTitle] = 0;
      userProgress.completedLessons = userProgress.completedLessons || {};
      userProgress.completedLessons[courseTitle] = [];
      localStorage.setItem("userData", JSON.stringify(userData));
      renderCourseDetails(document.getElementById("contentArea"), courses.find(course => course.title === courseTitle));
    }
  }
  
  // Complete a lesson
  function completeLesson(courseTitle, lessonId) {
    const userProgress = userData[currentUser.email];
    if (!userProgress.completedLessons[courseTitle]) {
      userProgress.completedLessons[courseTitle] = [];
    }
    userProgress.completedLessons[courseTitle].push(lessonId);
  
    // Calculate progress
    const course = courses.find(c => c.title === courseTitle);
    const totalLessons = course.lessons.length;
    const completedLessons = userProgress.completedLessons[courseTitle].length;
    userProgress.courseProgress[courseTitle] = (completedLessons / totalLessons) * 100;
  
    // Check if course is completed
    if (completedLessons === totalLessons) {
      userProgress.completedCourses.push({
        title: courseTitle,
        date: new Date().toISOString().split("T")[0],
        score: "90%", // Simulated score
        timeSpent: `${Math.floor(completedLessons / 2)}h ${completedLessons * 10}m`
      });
    }
  
    localStorage.setItem("userData", JSON.stringify(userData));
    renderCourseDetails(document.getElementById("contentArea"), course);
  }
  
  // Go back to the main courses list
  function goBackToCourses() {
    isCourseDetailsView = false;
    renderLearningTab(document.getElementById("contentArea"));
  }
  function viewMoreCourses() {
    if (currentTab !== "learning" || isCourseDetailsView) return;
    displayedCourses += 6;
    const query = document.getElementById("searchInput").value.toLowerCase();
    let courseList = courses;
    if (query) {
      courseList = courses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }
    renderCourses(courseList.slice(0, displayedCourses));
    if (displayedCourses >= courseList.length) {
      document.getElementById("viewMoreBtn").style.display = "none";
    }
  }