

export function renderadminLearning(container, ') {
    const courses = getCoursesFromStorage();
    const filteredCourses = courses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase())
    );
  
    container.innerHTML = `
      <h2>Learning</h2>
      <form id="courseForm">
        <input type="text" id="courseTitle" placeholder="Course Title" required />
        <textarea id="courseDescription" placeholder="Course Description" required></textarea>
        <button type="submit">Add Course</button>
      </form>
      <div id="courseList">
        ${filteredCourses.map(course => `
          <div class="course">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
          </div>
        `).join('')}
      </div>
    `;
  
    const form = container.querySelector('#courseForm');
    form.addEventListener('submit', handleCourseSubmit);
  }
  
  function handleCourseSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('courseTitle').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
  
    if (title && description) {
      const courses = getCoursesFromStorage();
      courses.push({ title, description });
      localStorage.setItem('courses', JSON.stringify(courses));
      

      const container = document.getElementById('contentArea');
      renderLearningTab(container);
    }
  }
  
  function getCoursesFromStorage() {
    return JSON.parse(localStorage.getItem('courses')) || [];
  }
  