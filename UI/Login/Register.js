const roleSelect = document.querySelector('#regRole');
const gradeGroup = document.querySelector('#gradeGroup');

roleSelect.addEventListener('change', () => {
  if (roleSelect.value === 'Student') {
    gradeGroup.style.display = 'block';
  } else {
    gradeGroup.style.display = 'none';
  }
});

// Handle form submission
async function handleRegister(e) {
  e.preventDefault();

  const name = document.querySelector('#regName').value;
  const surname = document.querySelector('#regSurname').value;
  const email = document.querySelector('#regEmail').value.toLowerCase().trim();
  const password = document.querySelector('#regPassword').value;
  const institution = document.querySelector('#regInstitution').value;
  const role = roleSelect.value;
  const grade = role === 'Student' ? document.querySelector('#regGrade').value : null;

  const feedbackElement = document.querySelector('#registerFeedback');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, email, password, institution, role, grade }),
    });

    const data = await res.json();
    console.log(data);

    if (data.token) {
      localStorage.setItem('token', data.token);

      feedbackElement.textContent = 'Successfully registered!';
      feedbackElement.style.color = 'green';
      feedbackElement.style.display = 'block';

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      feedbackElement.textContent = data.error || 'Registration failed!';
      feedbackElement.style.color = 'red';
      feedbackElement.style.display = 'block';
    }
  } catch (err) {
    feedbackElement.textContent = 'Server error. Please try again later.';
    feedbackElement.style.color = 'red';
    feedbackElement.style.display = 'block';
  }
}