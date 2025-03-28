document.addEventListener('DOMContentLoaded', () => {
    setupFormEventListeners();
    checkAuthStatus();
});

function setupFormEventListeners() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', handleLogin);

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Redirect based on role
        if (role === 'farmer') {
            window.location.href = 'farmer-dashboard.html';
        } else {
            window.location.href = 'product-list.html';
        }

    } catch (error) {
        errorMessage.textContent = error.message;
        console.error('Login error:', error);
    }
}

function handleGoogleLogin() {
    // Store the selected role before redirect
    const role = document.getElementById('role').value;
    localStorage.setItem('preferredRole', role);
    
    // Redirect to Google OAuth endpoint
    window.location.href = `http://127.0.0.1:3000/auth/google?role=${role}`;
}

// Handle Google Sign-in callback
function onGoogleSignIn(response) {
    const preferredRole = localStorage.getItem('preferredRole') || 'customer';
    
    fetch('http://127.0.0.1:3000/auth/google/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            token: response.credential,
            role: preferredRole
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('preferredRole');
            window.location.href = preferredRole === 'farmer' 
                ? 'farmer-dashboard.html' 
                : 'product-list.html';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        document.getElementById('error-message').textContent = 
            error.message || 'Google sign-in failed';
        console.error('Google sign-in error:', error);
    });
}

function checkAuthStatus() {
    fetch('http://127.0.0.1:3000/auth/verify', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            // Redirect if already logged in
            window.location.href = data.role === 'farmer' 
                ? 'farmer-dashboard.html' 
                : 'product-list.html';
        }
    })
    .catch(error => {
        console.error('Auth check error:', error);
    });
}

// Initialize Google Sign-in
window.onload = function() {
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: onGoogleSignIn
    });
};