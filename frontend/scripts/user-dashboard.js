document.addEventListener('DOMContentLoaded', () => {
    fetchCustomerInfo();
    fetchOrders();
    setupEventListeners();
});

function fetchCustomerInfo() {
    fetch('http://127.0.0.1:3000/users/customer-info', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch customer info');
        return response.json();
    })
    .then(data => {
        document.getElementById('customer-firstname').textContent = data.firstName;
        document.getElementById('customer-lastname').textContent = data.lastName;
        document.getElementById('customer-email').textContent = data.email;
        document.getElementById('customer-contact').textContent = data.contact || 'Not provided';
        document.getElementById('customer-address').textContent = data.address || 'Not provided';

        // Populate edit form
        document.getElementById('edit-firstname').value = data.firstName;
        document.getElementById('edit-lastname').value = data.lastName;
        document.getElementById('edit-email').value = data.email;
        document.getElementById('edit-contact').value = data.contact || '';
        document.getElementById('edit-address').value = data.address || '';
    })
    .catch(err => console.error("Error fetching customer info:", err));
}

function fetchOrders() {
    fetch('http://127.0.0.1:3000/api/customer/orders', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(orders => {
        const ordersList = document.querySelector('.orders-list');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = `
                <div class="order-card">
                    <div class="order-info">
                        <h3>Order #${order._id}</h3>
                        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                        <p>Total: ₹${order.total}</p>
                    </div>
                    <div class="order-status">
                        <p>Status: ${order.status}</p>
                        <button onclick="viewOrderDetails('${order._id}')">View Details</button>
                    </div>
                </div>
            `;
            ordersList.innerHTML += orderCard;
        });
    })
    .catch(err => console.error("Error fetching orders:", err));
}

function setupEventListeners() {
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    // Edit Profile Modal
    editProfileBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'block';
    });

    closeEditBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    // Profile Update
    editProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateProfile();
    });

    // Logout
    document.querySelector('.nav-link').addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:3000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'lp.html';
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    });
}

function updateProfile() {
    const formData = {
        firstName: document.getElementById('edit-firstname').value,
        lastName: document.getElementById('edit-lastname').value,
        email: document.getElementById('edit-email').value,
        contact: document.getElementById('edit-contact').value,
        address: document.getElementById('edit-address').value
    };

    fetch('http://127.0.0.1:3000/api/customer/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(() => {
        alert('Profile updated successfully!');
        document.getElementById('edit-profile-modal').style.display = 'none';
        fetchCustomerInfo();
    })
    .catch(err => {
        console.error("Error updating profile:", err);
        alert('Failed to update profile. Please try again.');
    });
}

function viewOrderDetails(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
}