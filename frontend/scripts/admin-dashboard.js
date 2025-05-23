//admin-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupEventListeners();
    loadDashboardData();
    initializeCharts();
    loadApprovals(); // Add this line to load approvals on page load
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

    window.addEventListener('click', event => {
        const modal = document.getElementById('order-details-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
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
        document.getElementById('total-revenue').textContent = `₹${data.totalRevenue.toFixed(2)}`;

        // Update charts
        updateCharts(data.chartData);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function initializeCharts() {
    const salesCanvas = document.getElementById('sales-chart');
    const productsCanvas = document.getElementById('products-chart');

    // Destroy existing charts if they exist
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    if (window.productsChart) {
        window.productsChart.destroy();
    }

    // Sales Chart
    const salesCtx = salesCanvas.getContext('2d');
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
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Products Chart
    const productsCtx = productsCanvas.getContext('2d');
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
    // window.salesChart.data.labels = data.salesLabels;
    // window.salesChart.data.datasets[0].data = data.salesData;
    window.salesChart.update();

    // Update Products Chart
   // window.productsChart.data.labels = data.productLabels;
    //window.productsChart.data.datasets[0].data = data.productData;
    window.productsChart.update();
}


async function loadUsers() {
    const roleFilter = document.getElementById('user-role-filter').value;
    try {
        const response = await fetch(`http://127.0.0.1:3000/admin/users?role=${roleFilter}`, {
            credentials: 'include'
        });
        const users = await response.json();
        console.log(users); 

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
        const response = await fetch(`http://127.0.0.1:3000/admin/products?category=${categoryFilter}`, {
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

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/admin/orders/${orderId}`, {
            credentials: 'include'
        });
        const order = await response.json();

        const modal = document.getElementById('order-details-modal');
        const modalBody = document.getElementById('order-details-body');

        // Construct order details HTML
        modalBody.innerHTML = `
            <p><strong>Order ID:</strong> #${order._id.slice(-6)}</p>
            <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
            <h3>Items:</h3>
            <ul>
                ${order.items.map(item => `
                    <li>${item.product.name} - Qty: ${item.quantity} - ₹${item.product.price.toFixed(2)}</li>
                `).join('')}
            </ul>
            <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Failed to fetch order details:', error);
        showToast('Failed to load order details', 'error');
    }
}

function closeOrderDetailsModal() {
    document.getElementById('order-details-modal').style.display = 'none';
}


async function loadOrders() {
    const statusFilter = document.getElementById('order-status-filter').value;
    try {
        const response = await fetch(`http://127.0.0.1:3000/admin/orders?status=${statusFilter}`, {
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
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
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

async function loadApprovals() {
    try{
        const response = await fetch(`http://127.0.0.1:3000/admin/approvals`, {
            credentials: 'include'
        });
        const approvals = await response.json();
        const approvalList = document.getElementById('approval-list');
        approvalList.innerHTML = approvals.map(approval => `
            <div class="approval-card">
                <h3>${approval.type} Approval</h3>
                <p>User: ${approval.user.firstName} ${approval.user.lastName}</p>
                <p>Details: ${approval.details}</p>
                <div class="approval-actions">
                    <button class="approve-btn" onclick="approveApproval('${approval._id}')">Approve</button>
                    <button class="reject-btn" onclick="rejectApproval('${approval._id}')">Reject</button>
                </div>
            </div>
        `).join('');
    }catch (error){
        console.error('Failed to load approvals: ', error);
        showToast('Failed to load approvals', 'error');
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
    switch (section) {
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