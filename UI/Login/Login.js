const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    // Get form values
    const email = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
  
    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
  
    console.log('Attempting to log in with:', { email, password });
  
    try {
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
  
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
  
      if (res.ok) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        
        // Add delay to see logs before redirect
        // Navigate based on user role
        //change it back to /Dashboard/InternDashboard
        // change it back to /Dashboard/AdminDashboard/Admindashboard.html
        if (data.user.role === 'Student') {
          setTimeout(() => {
            window.location.href = 'Dashboard/InternDashboard.html'; 
          }, 1000);
        } else if (data.user.role === 'Admin') {
          setTimeout(() => {
            window.location.href = 'Dashboard/AdminDashboard/Admindashboard.html';
          }, 1000);
        } else {
          alert('Unknown role. Please contact support.');
        }
      } else {
        console.error('Login error:', data.error);
        alert(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Unable to connect to server. Please try again later.');
    } finally {
      // Reset button state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    }
});