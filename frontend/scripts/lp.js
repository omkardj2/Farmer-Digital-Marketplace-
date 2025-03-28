document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#login-form");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const role = document.querySelector("#role");

    // Function to check cookie status
    function checkCookie() {
        console.log("All cookies:", document.cookie);
        const cookies = document.cookie.split(';');
        const authToken = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        console.log("Auth token cookie:", authToken);
        return authToken ? true : false;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Form validation
        if (!email.value.trim() || !password.value.trim() || !role.value) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    email: email.value,
                    password: password.value,
                    role: role.value
                })
            });

            const data = await response.json(); 

            if (response.ok) {
                console.log("Login successful!");
                
                // Check if cookie is set
                if (checkCookie()) {
                    console.log("Cookie set successfully");
                } else {
                    console.warn("Cookie not set after login");
                }

                // Redirect based on role
                if (data.role === "farmer") {
                    window.location.href = "farmer-dashboard.html";
                } else if (data.role === "customer") {
                    window.location.href = "product-list.html";
                } else {
                    window.location.href = "user-home.html";
                }
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in. Please try again.');
        }
    });

    // Google Login Button Handler
    const googleLoginButton = document.querySelector(".googleLogin");
    if (googleLoginButton) {
        googleLoginButton.addEventListener("click", () => {
            alert("Google Login functionality coming soon!");
        });
    }
});