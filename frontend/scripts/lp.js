document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
    setupFormValidation();
});

function setupFormValidation() {
    const form = document.querySelector("#login-form");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const role = document.querySelector("#role");

    form.addEventListener("submit", handleLogin);

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = password.type === 'password' ? 'text' : 'password';
            password.type = type;
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const role = document.querySelector("#role");
    const errorDiv = document.querySelector("#error-message");

    if (errorDiv) errorDiv.textContent = '';

    try {
        // Login request
        const loginResponse = await fetch('http://127.0.0.1:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value,
                role: role.value
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            throw new Error(loginData.message || 'Login failed');
        }

        // Verify token was set by checking auth status
        const verifyResponse = await fetch('http://127.0.0.1:3000/auth/verify', {
            credentials: 'include'
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            throw new Error('Authentication failed');
        }

        // Redirect based on role
        switch(loginData.role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'farmer':
                window.location.href = 'farmer-dashboard.html';
                break;
            case 'customer':
                window.location.href = 'product-list.html';
                break;
            case 'delivery':
                window.location.href = 'delivery-dashboard.html';
                break;
            default:
                throw new Error('Invalid user role');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'An error occurred during login');
    }
}

function checkCookie() {
    const cookies = document.cookie.split(';');
    const authToken = cookies.find(cookie => cookie.trim().startsWith('authToken='));
    return !!authToken;
}

function handleRedirect(role) {
    switch (role) {
        case 'admin':
            window.location.href = "admin-dashboard.html";
            break;
        case 'farmer':
            window.location.href = "farmer-dashboard.html";
            break;
        case 'customer':
            window.location.href = "product-list.html";
            break;
        default:
            showError("Invalid user role");
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch('http://127.0.0.1:3000/auth/verify', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.authenticated) {
            handleRedirect(data.role);
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

function showError(message) {
    const errorDiv = document.querySelector("#error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}