document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#login-form");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const role = document.querySelector("#role");
    const rememberMe = document.querySelector("#rememberMe");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Validation
        if (!email.value.trim()) {
            alert("Please enter your email.");
            return;
        }

        if (!password.value.trim()) {
            alert("Please enter your password.");
            return;
        }

        if (!role.value) {
            alert("Please select a user type.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value,
                    role: role.value
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert("Login successful!");
                // Redirect based on role
                if (data.role === "farmer") {
                    window.location.href = "user-dashboard.html"; // Farmer dashboard
                } else if (data.role === "customer") {
                    window.location.href = "product-list.html"; // Buyer product list
                } else {
                    window.location.href = "user-home-page.html"; // Default page
                }
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while logging in.');
        }
    });

    // Google Login Button Handler
    const googleLoginButton = document.querySelector(".googleLogin");
    googleLoginButton.addEventListener("click", () => {
        alert("Google Login is not implemented yet.");
        // Implement Google Login logic here
    });
});