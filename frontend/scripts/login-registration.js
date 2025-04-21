const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const goToSignup = document.getElementById('goToSignup');
const goToLogin = document.getElementById('goToLogin');

goToSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

goToLogin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Signup Form Submission
document.getElementById('signup-actual').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 1. Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const signupEmail = document.getElementById('signupEmail').value;
    const signupPassword = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const terms = document.getElementById('terms').checked;

    // 2. Validation
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword || !role || !terms) {
        alert("All fields are required!");
        return;
    }

    if (signupPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
        alert("Invalid email format!");
        return;
    }

    // 3. Send data to backend
    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email: signupEmail, password: signupPassword, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login with your credentials.');
            // Switch to login form after successful registration
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        } else {
            alert(`Registration failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
});

// Login Form Submission
document.getElementById('login-actual').addEventListener('submit', async function(event) {
    event.preventDefault();

    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;
    const loginRole = document.getElementById('loginRole').value;

    if (!loginEmail || !loginPassword || !loginRole) {
        alert("All fields are required!");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
        alert("Invalid email format!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword,
                role: loginRole
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            // Store user role in localStorage for future reference
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);

            // Redirect based on role
            switch(loginRole.toLowerCase()) {
                case 'admin':
                    window.location.href = 'admin-dashboard.html';
                    break;
                case 'farmer':
                    window.location.href = 'farmer-dashboard.html';
                    break;
                case 'delivery':
                    window.location.href = 'delivery-dashboard.html';
                    break;
                case 'customer':
                    window.location.href = 'user-dashboard.html';
                    break;
                default:
                    window.location.href = '/dashboard.html';
            }
        } else {
            alert(`Login failed: ${data.error || 'Invalid credentials'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
    }
});