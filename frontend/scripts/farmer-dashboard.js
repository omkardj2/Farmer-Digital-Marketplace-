document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadData();
    setupEventListeners();
    initializeCharts();
});

async function checkAuthAndLoadData() {
    try {
        const response = await fetch('http://127.0.0.1:3000/auth/verify', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Auth failed:', data.message);
            window.location.href = 'lp.html';
            return;
        }

        // Check if role matches
        if (data.role !== 'farmer') {
            console.error('Invalid role:', data.role);
            window.location.href = 'lp.html';
            return;
        }

        await Promise.all([
            loadFarmerProfile(),
            loadDashboardStats(),
            loadProducts(),
            loadOrders()
        ]);

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

    // Product Management
    document.getElementById('add-product-btn')?.addEventListener('click', () => {
        document.getElementById('add-product-modal').style.display = 'block';
    });

    document.querySelector('.close-btn')?.addEventListener('click', () => {
        document.getElementById('add-product-modal').style.display = 'none';
    });

    // Product image preview
    document.getElementById('product-image')?.addEventListener('change', handleImagePreview);

    // Forms
    document.getElementById('add-product-form')?.addEventListener('submit', handleAddProduct);
    document.getElementById('edit-profile-form')?.addEventListener('submit', handleProfileUpdate);

    // Filters
    document.getElementById('product-category-filter')?.addEventListener('change', loadProducts);
    document.getElementById('order-status-filter')?.addEventListener('change', loadOrders);

    // Search
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Set initial active section
    document.getElementById('dashboard').classList.add('active');
    document.querySelector('.nav-item[data-section="dashboard"]')?.classList.add('active');
}

async function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const currentSection = document.querySelector('.content-section.active').id;

    try {
        if (currentSection === 'products') {
            const response = await fetch(
                `http://127.0.0.1:3000/farmer/products/search?term=${searchTerm}`, {
                credentials: 'include'
            });
            const products = await response.json();
            updateProductsTable(products);
        } else if (currentSection === 'orders') {
            const response = await fetch(
                `http://127.0.0.1:3000/farmer/orders/search?term=${searchTerm}`, {
                credentials: 'include'
            });
            const orders = await response.json();
            updateOrdersTable(orders);
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed', 'error');
    }
}

function initializeCharts() {
    const salesCtx = document.getElementById('sales-chart')?.getContext('2d');
    if (salesCtx) {
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
    }

    // Products Chart
    const productsCtx = document.getElementById('products-chart')?.getContext('2d');
    if (productsCtx) {
        window.productsChart = new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

async function loadFarmerProfile() {
    try {
        const response = await fetch('http://127.0.0.1:3000/farmer/profile', {
            credentials: 'include'
        });
        
        const profile = await response.json();

        // Update profile section
        document.getElementById('farmer-name').textContent = 
            `${profile.firstName} ${profile.lastName}`;
        document.getElementById('profile-name').textContent = 
            `${profile.firstName} ${profile.lastName}`;
        document.getElementById('profile-email').textContent = profile.email;
        
        // Update form fields
        document.getElementById('edit-firstname').value = profile.firstName;
        document.getElementById('edit-lastname').value = profile.lastName;
        document.getElementById('edit-email').value = profile.email;
        document.getElementById('edit-contact').value = profile.contact || '';
        document.getElementById('edit-location').value = profile.address || '';

    } catch (error) {
        console.error('Failed to load profile:', error);
        showToast('Failed to load profile', 'error');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('http://127.0.0.1:3000/farmer/dashboard-stats', {
            credentials: 'include', // Include cookies
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }

        const stats = await response.json();
        console.log(stats);
        console.log(stats.stats.totalProducts);

        // Update the DOM with the fetched stats
        document.getElementById('total-products').textContent = stats.stats.totalProducts ||0;
        document.getElementById('active-orders').textContent = stats.stats.activeOrders || 0;
        document.getElementById('total-revenue').textContent = `₹${stats.stats.totalRevenue || 0}`;
        document.getElementById('monthly-revenue').textContent = `₹${stats.stats.monthlyRevenue || 0}`;

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        showToast('Failed to load dashboard stats', 'error');
    }
}

async function loadProducts() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/products', {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const products = await response.json();

        const productTableBody = document.querySelector('#products-table tbody');
        productTableBody.innerHTML = products
            .map(
                (product) => `
                <tr>
                    <td>
                        <img src="${product.image}" alt="${product.name}" class="product-thumb" width="50" height="50">
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category || 'Uncategorized'}</td>
                    <td>₹${product.price.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <span class="status-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </td>
                    <td>
                        <button onclick="editProduct('${product._id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${product._id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `
            )
            .join('');
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadOrders() {
    try {
        const status = document.getElementById('order-status-filter').value;
        const response = await fetch(
            `http://127.0.0.1:3000/farmer/orders?status=${status}`, {
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

async function handleAddProduct(event) {
    event.preventDefault();

    try {
        const form = event.target;
        const formData = new FormData();

        // Get form values
        const name = form.querySelector('#product-name').value;
        const category = form.querySelector('#product-category').value;
        const description = form.querySelector('#product-description').value;
        const price = form.querySelector('#product-price').value;
        const quantity = form.querySelector('#product-quantity').value;
        const imageFile = form.querySelector('#product-image').files[0];

        // Validate inputs
        if (!name || !category || !description || !price || !quantity) {
            throw new Error('Please fill in all required fields');
        }

        if (!imageFile) {
            throw new Error('Please select a product image');
        }

        // Append form data
        formData.append('name', name);
        formData.append('category', category); // Include category
        formData.append('description', description);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('image', imageFile);

        // Send request
        const response = await fetch('http://127.0.0.1:3000/api/addProduct', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add product');
        }

        showToast('Product added successfully', 'success');
        form.reset();
        document.getElementById('add-product-modal').style.display = 'none';
        await loadProducts();
    } catch (error) {
        console.error('Add product error:', error);
        showToast(error.message, 'error');
    }
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    const reader = new FileReader();

    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('http://127.0.0.1:3000/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                firstName: document.getElementById('edit-firstname').value,
                lastName: document.getElementById('edit-lastname').value,
                email: document.getElementById('edit-email').value,
                contact: document.getElementById('edit-contact').value,
                address: document.getElementById('edit-location').value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        showToast('Profile updated successfully', 'success');
        loadFarmerProfile();

    } catch (error) {
        console.error('Profile update error:', error);
        showToast(error.message, 'error');
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

function handleNavigation(event) {
    event.preventDefault();
    
    // Get section from data-section attribute
    const targetSection = event.currentTarget.getAttribute('data-section');
    if (!targetSection) return;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Hide all sections first
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Show selected section
    const sectionToShow = document.getElementById(targetSection);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
        sectionToShow.classList.add('active');

        // Reload section data if needed
        switch(targetSection) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'profile':
                loadFarmerProfile();
                break;
        }
    }
}

function updateCharts(data) {
    if (window.salesChart) {
        window.salesChart.data.labels = data.salesLabels;
        window.salesChart.data.datasets[0].data = data.salesData;
        window.salesChart.update();
    }

    if (window.productsChart) {
        window.productsChart.data.labels = data.productLabels;
        window.productsChart.data.datasets[0].data = data.productData;
        window.productsChart.update();
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

async function editProduct(productId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/farmer/products/${productId}`, {
            credentials: 'include'
        });
        const product = await response.json();

        // Populate form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;
        
        // Show product image preview
        document.getElementById('image-preview').src = product.image;
        document.getElementById('image-preview').style.display = 'block';

        // Show modal
        document.getElementById('add-product-modal').style.display = 'block';
        
        // Update form submission handler
        const form = document.getElementById('add-product-form');
        form.onsubmit = (e) => handleUpdateProduct(e, productId);

    } catch (error) {
        console.error('Edit product error:', error);
        showToast('Failed to load product details', 'error');
    }
}

async function handleUpdateProduct(event, productId) {
    event.preventDefault();
    
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('product-name').value);
        formData.append('category', document.getElementById('product-category').value);
        formData.append('description', document.getElementById('product-description').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('quantity', document.getElementById('product-quantity').value);

        const imageFile = document.getElementById('product-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await fetch(`http://127.0.0.1:3000/farmer/products/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        showToast('Product updated successfully', 'success');
        document.getElementById('add-product-modal').style.display = 'none';
        document.getElementById('add-product-form').reset();
        loadProducts();
        loadDashboardStats();

    } catch (error) {
        console.error('Update product error:', error);
        showToast(error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/farmer/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }

        showToast('Product deleted successfully', 'success');
        loadProducts();
        loadDashboardStats();

    } catch (error) {
        console.error('Delete product error:', error);
        showToast(error.message, 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/farmer/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        showToast('Order status updated successfully', 'success');
        loadOrders();
        loadDashboardStats();

    } catch (error) {
        console.error('Update order status error:', error);
        showToast(error.message, 'error');
    }
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/farmer/orders/${orderId}`, {
            credentials: 'include'
        });
        
        const order = await response.json();
        
        // Implement order details view logic here
        // You might want to show this in a modal
        console.log('Order details:', order);

    } catch (error) {
        console.error('View order details error:', error);
        showToast('Failed to load order details', 'error');
    }
}