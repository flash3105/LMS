// Global variables to store data
export let courses = [];
export let userData = {};
export let messages = [];

// Fetch courses from the database
export async function fetchCourses() {
  try {
    const response = await fetch('http://localhost:5000/api/courses/all'); // Replace with your API endpoint
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
    const response = await fetch(`http://localhost:5000/api/user/${userId}`); // Replace with your API endpoint
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
    const response = await fetch(`http://localhost:5000/api/messages?userId=${userId}`); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    messages = await response.json();

    // Optionally, store messages in localStorage for offline access
    localStorage.setItem('messages', JSON.stringify(messages));
    console.log('Messages fetched and stored globally:', messages);
  } catch (error) {
    console.error('Error fetching messages:', error);

    // Fallback to localStorage if API fails
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      messages = JSON.parse(storedMessages);
      console.log('Loaded messages from localStorage:', messages);
    }
  }
}

// data.js
export async function fetchCourseDetails(courseId) {
  try {
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}/resources`);
    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
}

