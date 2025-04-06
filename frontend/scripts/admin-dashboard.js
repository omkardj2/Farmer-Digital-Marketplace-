document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupEventListeners();
    loadDashboardData();
    initializeCharts();
});

async function checkAdminAuth() {
    try {
        const response = await fetch('http://127.0.0.1:3000/admin/verify', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok || !data.isAdmin) {
            window.location.href = 'lp.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'lp.html';
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    document.querySelector('.logout').addEventListener('click', handleLogout);

    // Search functionality
    document.querySelector('.search-bar input').addEventListener('input', 
        debounce(handleSearch, 300));

    // Filters
    document.getElementById('user-role-filter')?.addEventListener('change', loadUsers);
    document.getElementById('product-category-filter')?.addEventListener('change', loadProducts);
    document.getElementById('order-status-filter')?.addEventListener('change', loadOrders);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Forms
    document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
}

async function loadDashboardData() {
    try {
        const response = await fetch('http://127.0.0.1:3000/admin/dashboard-stats', {
            credentials: 'include'
        });
        const data = await response.json();

        // Update stats
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('active-orders').textContent = data.activeOrders;
        document.getElementById('total-products').textContent = data.totalProducts;
        document.getElementById('total-revenue').textContent = 
            `₹${data.totalRevenue.toFixed(2)}`;

        // Update charts
        updateCharts(data.chartData);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    window.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Sales',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Products Chart
    const productsCtx = document.getElementById('products-chart').getContext('2d');
    window.productsChart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#E91E63',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateCharts(data) {
    // Update Sales Chart
    window.salesChart.data.labels = data.salesLabels;
    window.salesChart.data.datasets[0].data = data.salesData;
    window.salesChart.update();

    // Update Products Chart
    window.productsChart.data.labels = data.productLabels;
    window.productsChart.data.datasets[0].data = data.productData;
    window.productsChart.update();
}

async function loadUsers() {
    const roleFilter = document.getElementById('user-role-filter').value;
    try {
        const response = await fetch(
            `http://127.0.0.1:3000/admin/users?role=${roleFilter}`, {
            credentials: 'include'
        });
        const users = await response.json();
        
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <span class="status-badge ${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button onclick="editUser('${user._id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser('${user._id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load users:', error);
        showToast('Failed to load users', 'error');
    }
}

async function loadProducts() {
    const categoryFilter = document.getElementById('product-category-filter').value;
    try {
        const response = await fetch(
            `http://127.0.0.1:3000/admin/products?category=${categoryFilter}`, {
            credentials: 'include'
        });
        const products = await response.json();
        
        const tbody = document.querySelector('#products-table tbody');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-thumb">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.farmer.firstName} ${product.farmer.lastName}</td>
                <td>
                    <button onclick="editProduct('${product._id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product._id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Failed to load products', 'error');
    }
}

async function loadOrders() {
    const statusFilter = document.getElementById('order-status-filter').value;
    try {
        const response = await fetch(
            `http://127.0.0.1:3000/admin/orders?status=${statusFilter}`, {
            credentials: 'include'
        });
        const orders = await response.json();
        
        const tbody = document.querySelector('#orders-table tbody');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order._id.slice(-6)}</td>
                <td>${order.customer.firstName} ${order.customer.lastName}</td>
                <td>${order.items.length} items</td>
                <td>₹${order.total.toFixed(2)}</td>
                <td>
                    <select onchange="updateOrderStatus('${order._id}', this.value)"
                            class="status-select ${order.status}">
                        <option value="pending" 
                            ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing"
                            ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped"
                            ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered"
                            ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewOrderDetails('${order._id}')" class="view-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

function handleNavigation(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Show selected section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    // Load section data
    switch(section) {
        case 'users':
            loadUsers();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'approvals':
            loadApprovals();
            break;
    }
}

async function handleLogout() {
    try {
        const response = await fetch('http://127.0.0.1:3000/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = 'lp.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}