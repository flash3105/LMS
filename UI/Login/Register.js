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
  const idNumber = document.querySelector('#regIdNumber').value;
  const email = document.querySelector('#regEmail').value.toLowerCase().trim();
  const password = document.querySelector('#regPassword').value;
  const institution = document.querySelector('#regInstitution').value;
  const role = roleSelect.value;
  const grade = role === 'Student' ? document.querySelector('#regGrade').value : null;

  console.log('Registration data:', { name, surname, idNumber, email, institution, role, grade }); 

  const feedbackElement = document.querySelector('#registerFeedback');

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, idNumber, email, password, institution, role, grade }),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      // Update success message to reflect pending approval
      feedbackElement.textContent = data.message || 'Registration successful! Your account is pending approval. You will be able to login once approved by an administrator.';
      feedbackElement.style.color = 'green';
      feedbackElement.style.display = 'block';

      // Clear the form
      document.querySelector('#registerForm').reset();
      gradeGroup.style.display = 'none';

      // Redirect after a delay
      setTimeout(() => {
        hideRegister(); // Close the registration popup
      }, 3000);
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