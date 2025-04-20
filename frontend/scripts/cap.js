document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#signup-form");
    const firstName = document.querySelector("#firstName");
    const lastName = document.querySelector("#lastName");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirmPassword");
    const role = document.querySelector("#role");
    const termsCheckbox = document.querySelector("#terms");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Validation
        if (!firstName.value.trim() || !lastName.value.trim()) {
            alert("Please enter your first and last name.");
            return;
        }

        if (!email.value.trim()) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password.value.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (password.value !== confirmPassword.value) {
            alert("Passwords do not match.");
            return;
        }

        if (!role.value) {
            alert("Please select a role.");
            return;
        }

        if (!termsCheckbox.checked) {
            alert("You must agree to the Terms & Conditions.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    password: password.value,
                    role: role.value
                })
            });

            if (response.ok) {
                alert("Account created successfully!");
                form.reset();
                window.location.href = 'lp.html'; // Redirect to login page
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the account.');
        }
    });

    // "Go to Login" link handler
    const goToLogin = document.querySelector("#goToLogin");
    if (goToLogin) {
        goToLogin.addEventListener("click", () => {
            window.location.href = 'lp.html'; // Redirect to login page
        });
    }
});
