document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/auth/verify', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            // If not authenticated, redirect to login
            window.location.href = 'lp.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'lp.html';
    }
});