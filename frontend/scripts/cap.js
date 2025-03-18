
document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");
    const firstName = document.querySelector("input[placeholder='First name']");
    const lastName = document.querySelector("input[placeholder='Last name']");
    const email = document.querySelector("input[type='email']");
    const password = document.querySelector("input[placeholder='Set Password']");
    const confirmPassword = document.querySelector("input[placeholder='Confirm Password']");
    const role = document.querySelector("select");
    const termsCheckbox = document.querySelector("input[type='checkbox']");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

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

        // If all checks pass, simulate successful form submission
        alert("Account created successfully!");
        form.reset(); // Reset form after successful submission
    });
});
