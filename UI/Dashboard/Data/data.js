// Global variables to store data
export let courses = [];
export let userData = {};
export let messages = [];

// Base URL for the API (from environment variable or fallback)
const API_BASE_URL = window.API_BASE_URL ;

// Fetch courses from the database
export async function fetchCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    courses = await response.json();

    // Optionally, store courses in localStorage for offline access
    localStorage.setItem('courses', JSON.stringify(courses));
    console.log('Courses fetched and stored globally:', courses);
  } catch (error) {
    console.error('Error fetching courses:', error);

    // Fallback to localStorage if API fails
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      courses = JSON.parse(storedCourses);
      console.log('Loaded courses from localStorage:', courses);
    }
  }
}

// Fetch user data from the database
export async function fetchUserData(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    userData = await response.json();

    // Optionally, store user data in localStorage for offline access
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('User data fetched and stored globally:', userData);
  } catch (error) {
    console.error('Error fetching user data:', error);

    // Fallback to localStorage if API fails
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      userData = JSON.parse(storedUserData);
      console.log('Loaded user data from localStorage:', userData);
    }
  }
}

// Fetch messages from the database
export async function fetchMessages(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const result = await response.json();
    messages = Array.isArray(result) ? result : [];
    localStorage.setItem('messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Fallback to localStorage if API fails
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      messages = Array.isArray(parsed) ? parsed : [];
    } else {
      messages = [];
    }
  }
}

// Fetch course details/resources
export async function fetchCourseDetails(courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/resources`);
    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
}

// Fetch assessments for a course from the database - now includes course name handling
export async function fetchAssessments(courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assessments`);
    if (!response.ok) {
      throw new Error('Failed to fetch assessments');
    }
    const data = await response.json();
    
    // Convert object to flat array
    const flatAssessments = [];
    
    Object.keys(data).forEach(folder => {
      data[folder].forEach(assessment => {
        assessment.courseId = courseId;
        if (!assessment.courseName) {
          assessment.courseName = `Course ${courseId.substring(0, 8)}`;
        }
        assessment.folderType = folder; // Keep folder info if needed
        flatAssessments.push(assessment);
      });
    });
    
    return flatAssessments; // Now returns an array
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw error;
  }
}

// Fetch all assessments from the database
export async function fetchAllAssessments() {
  try {
    const response = await fetch(`${API_BASE_URL}/assessments`);
    if (!response.ok) throw new Error('Failed to fetch all assessments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all assessments:', error);
    throw error;
  }
}

// Fetch all quizzes from the database
export async function fetchAllQuizzes() {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/all`);
    if (!response.ok) throw new Error('Failed to fetch all quizzes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    throw error;
  }
}

// Fetch assessments for a specific user from the database
export async function fetchUserAssessments(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/assessments`);
    if (!response.ok) throw new Error('Failed to fetch user assessments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    throw error;
  }
}

// Fetch quizzes for a specific user from the database
export async function fetchUserQuizzes(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/quizzes`);
    if (!response.ok) throw new Error('Failed to fetch user quizzes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    throw error;
  }
}