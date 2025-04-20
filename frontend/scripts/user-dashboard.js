document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadData();
    setupEventListeners();
});

async function checkAuthAndLoadData() {
    try {
        const response = await fetch('http://127.0.0.1:3000/auth/verify', {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || data.role !== 'customer') {
            window.location.href = 'lp.html';
            return;
        }

        await Promise.all([
            loadUserProfile(),
            loadDashboardStats(),
            loadRecentOrders(),
            loadCartItems(),
            loadWishlistItems(),
            loadActiveDeliveries()
        ]);

    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'lp.html';
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    document.querySelector('.logout').addEventListener('click', handleLogout);

    // Profile form
    document.getElementById('edit-profile-form').addEventListener('submit', handleProfileUpdate);

    // Search
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Checkout button
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        window.location.href = 'user-checkout-page.html';
    });
}

async function loadUserProfile() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/customer-info', {
            credentials: 'include'
        });
        
        const profile = await response.json();

        // Update profile information
        document.getElementById('user-name').textContent = `${profile.firstName} ${profile.lastName}`;
        document.getElementById('profile-name').textContent = `${profile.firstName} ${profile.lastName}`;
        document.getElementById('profile-email').textContent = profile.email;
        
        // Update form fields
        document.getElementById('edit-firstname').value = profile.firstName;
        document.getElementById('edit-lastname').value = profile.lastName;
        document.getElementById('edit-email').value = profile.email;
        document.getElementById('edit-phone').value = profile.contact || '';
        document.getElementById('edit-address').value = profile.address || '';

    } catch (error) {
        console.error('Failed to load profile:', error);
        showToast('Failed to load profile', 'error');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/dashboard-stats', {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }

        const stats = await response.json();
        console.log('Dashboard stats:', stats);

        // Update DOM elements with the stats
        document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        document.getElementById('wishlist-count').textContent = stats.wishlistItems || 0;
        document.getElementById('cart-count').textContent = stats.cartItems || 0;
        document.getElementById('total-spent').textContent = `₹${(stats.totalSpent || 0).toFixed(2)}`;

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}


async function loadRecentOrders() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/recent-orders', {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load recent orders');
        }

        const orders = await response.json();

        if (!Array.isArray(orders)) {
            throw new TypeError('Expected an array of orders');
        }

        console.log('Recent orders:', orders);
    } catch (error) {
        console.error('Failed to load recent orders:', error);
    }
}

async function loadCartItems() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/cart', {
            credentials: 'include'
        });
        const items = await response.json();

        const cartContainer = document.getElementById('cart-items');
        let subtotal = 0;

        if (items.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        } else {
            cartContainer.innerHTML = items.map(item => {
                subtotal += item.price * item.quantity;
                return `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button onclick="removeFromCart('${item._id}')" class="remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;

    } catch (error) {
        console.error('Failed to load cart items:', error);
        showToast('Failed to load cart items', 'error');
    }
}

async function loadWishlistItems() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/wishlist', {
            credentials: 'include',
        });
        const items = await response.json();

        const wishlistContainer = document.getElementById('wishlist-items');
        wishlistContainer.innerHTML = items.map((item) => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)}</p>
                <button onclick="addToCart('${item._id}')" class="add-to-cart-btn">
                    Add to Cart
                </button>
                <button onclick="removeFromWishlist('${item._id}')" class="remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load wishlist items:', error);
        showToast('Failed to load wishlist items', 'error');
    }
}

async function removeFromWishlist(productId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/users/wishlist/remove/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from wishlist');
        }

        showToast('Item removed from wishlist', 'success');
        loadWishlistItems();
    } catch (error) {
        console.error('Failed to remove item from wishlist:', error);
        showToast('Failed to remove item from wishlist', 'error');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('http://127.0.0.1:3000/users/customer/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                firstName: document.getElementById('edit-firstname').value,
                lastName: document.getElementById('edit-lastname').value,
                email: document.getElementById('edit-email').value,
                contact: document.getElementById('edit-phone').value,
                address: document.getElementById('edit-address').value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        showToast('Profile updated successfully', 'success');
        loadUserProfile();

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
    
    const targetSection = event.currentTarget.getAttribute('data-section');
    if (!targetSection) return;

    console.log('Navigation clicked:', targetSection); // Debug log

    // Update active navigation item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Hide all sections first
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(targetSection);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // Refresh section data
        switch(targetSection) {
            case 'dashboard':
                loadDashboardStats();
                loadRecentOrders();
                break;
            case 'orders':
                loadRecentOrders();
                break;
            case 'cart':
                loadCartItems();
                break;
            case 'wishlist':
                loadWishlistItems();
                break;
            case 'profile':
                loadUserProfile();
                break;
        }
    } else {
        console.error(`Section with id "${targetSection}" not found`);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const currentSection = document.querySelector('.content-section.active').id;

    try {
        if (currentSection === 'orders') {
            // Example: Search orders
            console.log(`Searching orders for: ${searchTerm}`);
        } else if (currentSection === 'wishlist') {
            // Example: Search wishlist
            console.log(`Searching wishlist for: ${searchTerm}`);
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed', 'error');
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

async function loadActiveDeliveries() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/active-deliveries', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load active deliveries');
        }

        const deliveries = await response.json();
        const tableBody = document.querySelector('#active-deliveries-table tbody');
        
        if (deliveries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No active deliveries</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = deliveries.map(delivery => `
            <tr>
                <td>${delivery.order_id}</td>
                <td>${delivery.items.length} items</td>
                <td>
                    <span class="delivery-status status-${delivery.status.toLowerCase()}">
                        ${delivery.status}
                    </span>
                </td>
                <td>${new Date(delivery.last_updated).toLocaleString()}</td>
                <td>
                    <button class="track-button" onclick="trackDelivery('${delivery.order_id}')">
                        <i class="fas fa-map-marker-alt"></i> Track
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Failed to load active deliveries:', error);
        showToast('Failed to load active deliveries', 'error');
    }
}

async function trackDelivery(orderId) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/delivery/track/${orderId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load delivery tracking data');
        }

        const deliveryData = await response.json();
        
        // Hide the deliveries list and show the map
        document.querySelector('.active-deliveries').style.display = 'none';
        const mapContainer = document.getElementById('delivery-map-container');
        mapContainer.style.display = 'block';

        // Update delivery info panel
        const infoPanel = document.querySelector('.delivery-info-panel');
        infoPanel.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h4>Order #${deliveryData.order_id}</h4>
                    <p>Status: 
                        <span class="delivery-status status-${deliveryData.status.toLowerCase()}">
                            ${deliveryData.status}
                        </span>
                    </p>
                </div>
                <div class="col-md-6">
                    <p><strong>Delivery Address:</strong><br>${deliveryData.address}</p>
                    <p><strong>Estimated Delivery:</strong><br>${deliveryData.estimated_delivery}</p>
                </div>
            </div>
        `;

        // Initialize/update map
        initializeDeliveryMap(deliveryData);

    } catch (error) {
        console.error('Failed to track delivery:', error);
        showToast('Failed to load tracking information', 'error');
    }
}

function showDeliveryList() {
    document.querySelector('.active-deliveries').style.display = 'block';
    document.getElementById('delivery-map-container').style.display = 'none';
}

function initializeDeliveryMap(deliveryData) {
    const map = L.map('delivery-map').setView([deliveryData.lat, deliveryData.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([deliveryData.lat, deliveryData.lng])
        .bindPopup(`Order #${deliveryData.order_id}<br>Status: ${deliveryData.status}`)
        .addTo(map);

    // Set up WebSocket connection for real-time updates
    const ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const deliverySocket = new WebSocket(
        ws_scheme + '://' + window.location.host + 
        '/ws/delivery/' + deliveryData.order_id + '/'
    );

    deliverySocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.order_id === deliveryData.order_id) {
            // Update marker position
            marker.setLatLng([data.lat, data.lng]);
            marker.getPopup().setContent(
                `Order #${data.order_id}<br>Status: ${data.status}`
            );
            
            // Update status in info panel
            const statusSpan = document.querySelector('.delivery-status');
            statusSpan.className = `delivery-status status-${data.status.toLowerCase()}`;
            statusSpan.textContent = data.status;
        }
    };
}