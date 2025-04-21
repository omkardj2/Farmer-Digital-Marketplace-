document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#signup-form");
    const firstName = document.querySelector("#firstName");
    const lastName = document.querySelector("#lastName");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirmPassword");
    const role = document.querySelector("#role");
    const termsCheckbox = document.querySelector("#terms");
    const vehicleDetails = document.querySelector("#vehicleDetails");
    const vehicleNumber = document.querySelector("#vehicleNumber");
    const vehicleType = document.querySelector("#vehicleType");
    const phone = document.querySelector("#phone");

    // Show/hide vehicle details based on role selection
    role.addEventListener("change", () => {
        if (role.value === "delivery") {
            vehicleDetails.style.display = "block";
        } else {
            vehicleDetails.style.display = "none";
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Validation
        if (!firstName.value.trim() || !lastName.value.trim()) {
            alert("Please enter your first and last name.");
            return;
        }

        if (!email.value.trim() || !email.value.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!phone.value.trim() || !/^[0-9]{10}$/.test(phone.value.trim())) {
            alert("Please enter a valid 10-digit phone number.");
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

        // Additional validation for delivery person
        if (role.value === "delivery") {
            if (!vehicleNumber.value.trim()) {
                alert("Please enter your vehicle number.");
                return;
            }
            if (!vehicleType.value) {
                alert("Please select your vehicle type.");
                return;
            }
        }

        if (!termsCheckbox.checked) {
            alert("You must agree to the Terms & Conditions.");
            return;
        }

        const registrationData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            password: password.value,
            role: role.value,
            phone: phone.value.trim()
        };

        // Add vehicle details if role is delivery
        if (role.value === "delivery") {
            registrationData.vehicleNumber = vehicleNumber.value.trim();
            registrationData.vehicleType = vehicleType.value;
        }

        try {
            console.log('Sending registration request:', registrationData);
            const response = await fetch('http://127.0.0.1:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert("Account created successfully!");
                form.reset();
                window.location.href = 'lp.html'; // Redirect to login page
            } else {
                console.error('Registration failed:', data);
                alert(`Registration failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Failed to connect to server. Please try again later.');
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
