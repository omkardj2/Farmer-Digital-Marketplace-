document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadRecentOrders();
});

async function loadHeader() {
    try {
        const response = await fetch('components/header.html');
        const html = await response.text();
        document.getElementById('header-placeholder').innerHTML = html;
    } catch (error) {
        console.error('Failed to load header:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/recent-orders', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load recent orders');
        }

        const orders = await response.json();
        const container = document.getElementById('recent-orders-container');
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">No recent orders found.</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Order #${order.order_id}</h3>
                <div class="order-info">
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                        <span class="delivery-status status-${order.status.toLowerCase()}">
                            ${order.status}
                        </span>
                    </p>
                    <p><strong>Items:</strong> ${order.items.length}</p>
                    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                </div>
                <a href="#" class="track-button" onclick="trackOrder('${order.order_id}')">
                    Track Order
                </a>
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to load recent orders:', error);
        document.getElementById('recent-orders-container').innerHTML = 
            '<p class="error">Failed to load recent orders. Please try again later.</p>';
    }
}

async function trackOrder(orderId = null) {
    const orderIdToTrack = orderId || document.getElementById('orderIdInput').value;
    
    if (!orderIdToTrack) {
        showError('Please enter an order ID');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/delivery/track/${orderIdToTrack}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Order not found');
        }

        const deliveryData = await response.json();
        showTrackingResult(deliveryData);
        initializeMap(deliveryData);

    } catch (error) {
        showError('Order not found or tracking unavailable');
    }
}

function showTrackingResult(data) {
    const resultDiv = document.getElementById('tracking-result');
    const mapContainer = document.getElementById('map-container');
    
    document.querySelector('.delivery-info-panel').innerHTML = `
        <div class="delivery-info">
            <h3>Order #${data.order_id}</h3>
            <div class="order-details">
                <p><strong>Status:</strong> 
                    <span class="delivery-status status-${data.status.toLowerCase()}">
                        ${data.status}
                    </span>
                </p>
                <p><strong>Delivery Address:</strong><br>${data.address}</p>
                <p><strong>Estimated Delivery:</strong><br>${data.estimated_delivery}</p>
            </div>
            
            <div class="delivery-timeline">
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>Order Confirmed</h4>
                        <p>${new Date(data.created_at).toLocaleString()}</p>
                    </div>
                </div>
                
                ${data.status !== 'pending' ? `
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>Out for Delivery</h4>
                        <p>${new Date(data.updated_at).toLocaleString()}</p>
                    </div>
                </div>
                ` : ''}
                
                ${data.status === 'delivered' ? `
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>Delivered</h4>
                        <p>${new Date(data.delivered_at).toLocaleString()}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    mapContainer.style.display = 'block';
}

function initializeMap(deliveryData) {
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
            
            // Update status display
            const statusSpan = document.querySelector('.delivery-status');
            statusSpan.className = `delivery-status status-${data.status.toLowerCase()}`;
            statusSpan.textContent = data.status;
            
            // Update timeline if needed
            if (data.status === 'delivered') {
                updateTimeline(data);
            }
        }
    };
}

function updateTimeline(data) {
    const timeline = document.querySelector('.delivery-timeline');
    if (!timeline.querySelector('.timeline-item:last-child .fa-check')) {
        timeline.insertAdjacentHTML('beforeend', `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="timeline-content">
                    <h4>Delivered</h4>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </div>
        `);
    }
}

function showError(message) {
    const resultDiv = document.getElementById('tracking-result');
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        </div>
    `;
    document.getElementById('map-container').style.display = 'none';
} 