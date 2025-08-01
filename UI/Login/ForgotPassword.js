// This file handles the Forgot Password functionality, including token validation and password reset.

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    const forgotContainer = document.getElementById('forgotContainer');
    const forgotForm = document.getElementById('forgotForm');
    const resetContainer = document.getElementById('resetContainer');
    const resetForm = document.getElementById('resetForm');
    const resetError = document.getElementById('resetError');
    
    // Check for token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    if (resetToken) {
        showResetForm(resetToken);
        validateToken(resetToken);
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }
});

function showResetForm(token) {
    const forgotContainer = document.getElementById('forgotContainer');
    const resetContainer = document.getElementById('resetContainer');
    const resetTokenInput = document.getElementById('resetToken');
    
    if (forgotContainer) forgotContainer.style.display = 'none';
    if (resetContainer) resetContainer.style.display = 'block';
    if (resetTokenInput) resetTokenInput.value = token;
}

async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        // First check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('Invalid response from server');
        }

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || 'Invalid token');
        }

        console.log('Token validated successfully');
    } catch (error) {
        console.error('Token validation failed:', error);
        showTokenError(error.message || 'This password reset link is invalid or has expired.');
    }
}

function showTokenError(message) {
    const resetError = document.getElementById('resetError');
    const resetForm = document.getElementById('resetForm');
    
    if (resetError) {
        resetError.textContent = message;
        resetError.style.display = 'block';
    }
    
    if (resetForm) {
        resetForm.querySelectorAll('input, button').forEach(el => {
            el.disabled = true;
        });
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process request');
        }

        // Generic success message
        alert('If this email is registered, you will receive a password reset link shortly. Please check your inbox.');
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred. Please try again later.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = document.getElementById('resetToken').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const resetError = document.getElementById('resetError');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    if (resetError) {
        resetError.style.display = 'none';
    }

    if (newPassword !== confirmPassword) {
        if (resetError) {
            resetError.textContent = 'Passwords do not match';
            resetError.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to reset password');
        }

        alert('Password has been reset successfully. You can now login with your new password.');
        window.location.href = '/UI';
    } catch (error) {
        console.error('Error:', error);
        if (resetError) {
            resetError.textContent = error.message || 'An error occurred. Please try again.';
            resetError.style.display = 'block';
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
    }
}