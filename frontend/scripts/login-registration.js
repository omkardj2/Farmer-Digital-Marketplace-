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
document.getElementById('signup-actual').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

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

    // Basic email validation (you might want a more robust regex)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
        alert("Invalid email format!");
        return;
    }

    console.log({ firstName, lastName, signupEmail, signupPassword, role, terms });

});

// Login Form Submission
document.getElementById('login-actual').addEventListener('submit', function(event) {
    event.preventDefault();

    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;
    const loginRole = document.getElementById('loginRole').value;

    // 1. Get Values
    if (!loginEmail || !loginPassword || !loginRole) {
        alert("All fields are required!");
        return;
    }

    // 2. Validation (Add more validation if needed)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
        alert("Invalid email format!");
        return;
    }

    console.log({ loginEmail, loginPassword, loginRole });

});