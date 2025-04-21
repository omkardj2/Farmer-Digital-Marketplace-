// Get current page name
const currentPage = window.location.pathname.split('/').pop();

// Get user role from localStorage
const userRole = localStorage.getItem('userRole');

// Define allowed roles for each dashboard
const allowedRoles = {
    'admin-dashboard.html': ['admin'],
    'farmer-dashboard.html': ['farmer'],
    'delivery-dashboard.html': ['delivery'],
    'user-dashboard.html': ['customer']
};

// Check if user has permission to access this dashboard
async function checkDashboardAccess() {
    try {
        // First verify if the token is valid
        const response = await fetch('http://localhost:3000/auth/verify', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        // Check if user has permission for this dashboard
        const allowedRolesForPage = allowedRoles[currentPage];
        if (!allowedRolesForPage || !allowedRolesForPage.includes(userRole?.toLowerCase())) {
            throw new Error('Unauthorized access');
        }

    } catch (error) {
        console.error('Access denied:', error);
        // Redirect to login page
        window.location.href = 'login-registration.html';
    }
}

// Run check when page loads
document.addEventListener('DOMContentLoaded', checkDashboardAccess);
