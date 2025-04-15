document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = 'Dashboard/InternDashboard.html';
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Server error');
    }
});
