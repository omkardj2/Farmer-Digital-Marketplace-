let socket;
let map;
let markers = {};
let marker;
let deliveryPersonId;
let watchId;

// Initialize the map
function initMap() {
    // Default to a center point (can be updated with actual location)
    const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Center of India
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Initialize marker
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: 'Delivery Person'
    });

    // Get delivery person ID from hidden input
    deliveryPersonId = document.getElementById('delivery-person-id').value;
    
    // Start tracking location
    startLocationTracking();
}

// Start tracking the delivery person's location
function startLocationTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Update the marker position on the map
function updateLocation(position) {
    const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // Update marker position
    marker.setPosition(newPosition);
    map.setCenter(newPosition);

    // Send location update to server
    updateLocationOnServer(newPosition);
}

// Handle location errors
function handleLocationError(error) {
    let errorMessage = 'Error getting location: ';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage += 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage += 'The request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            errorMessage += 'An unknown error occurred.';
            break;
    }
    console.error(errorMessage);
}

// Send location update to server
function updateLocationOnServer(position) {
    fetch('http://127.0.0.1:3000/api/delivery/update-location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            deliveryPersonId: deliveryPersonId,
            latitude: position.lat,
            longitude: position.lng
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Location updated successfully');
        } else {
            console.error('Failed to update location:', data.message);
        }
    })
    .catch(error => {
        console.error('Error updating location:', error);
    });
}

// Load active deliveries
function loadActiveDeliveries() {
    fetch(`http://127.0.0.1:3000/api/delivery/active-deliveries/${deliveryPersonId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayActiveDeliveries(data.deliveries);
            } else {
                console.error('Failed to load active deliveries:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading active deliveries:', error);
        });
}

// Display active deliveries in the UI
function displayActiveDeliveries(deliveries) {
    const deliveriesContainer = document.getElementById('active-deliveries');
    deliveriesContainer.innerHTML = '';

    deliveries.forEach(delivery => {
        const deliveryItem = document.createElement('div');
        deliveryItem.className = 'delivery-item';
        
        const statusClass = getStatusClass(delivery.status);
        
        deliveryItem.innerHTML = `
            <h3>Order #${delivery.orderId}</h3>
            <p><strong>Customer:</strong> ${delivery.customerName}</p>
            <p><strong>Address:</strong> ${delivery.deliveryAddress}</p>
            <p><strong>Status:</strong> <span class="delivery-status ${statusClass}">${delivery.status}</span></p>
        `;
        
        deliveriesContainer.appendChild(deliveryItem);
    });
}

// Get CSS class for delivery status
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'in-progress':
            return 'status-in-progress';
        case 'delivered':
            return 'status-delivered';
        default:
            return '';
    }
}

// Handle logout
document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear any stored data
    localStorage.removeItem('deliveryPersonId');
    localStorage.removeItem('token');
    
    // Stop location tracking
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    
    // Redirect to login page
    window.location.href = '/login-registration.html';
});

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login-registration.html';
        return;
    }

    // Load active deliveries
    loadActiveDeliveries();
    
    // Set up periodic refresh of deliveries
    setInterval(loadActiveDeliveries, 30000); // Refresh every 30 seconds
});

// Connect to WebSocket server
function connectWebSocket(deliveryPersonId) {
    const wsUrl = `ws://${window.location.hostname}:3000/ws/delivery/${deliveryPersonId}`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => connectWebSocket(deliveryPersonId), 5000);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'location_update':
            updateDeliveryLocation(data.deliveryPersonId, data.location);
            break;
        case 'delivery_status':
            updateDeliveryStatus(data.orderId, data.status);
            break;
        case 'initial_data':
            handleInitialData(data);
            break;
    }
}

// Update delivery person's location on the map
function updateDeliveryLocation(deliveryPersonId, location) {
    const position = {
        lat: location.latitude,
        lng: location.longitude
    };

    if (!markers[deliveryPersonId]) {
        markers[deliveryPersonId] = new google.maps.Marker({
            position: position,
            map: map,
            title: `Delivery Person ${deliveryPersonId}`
        });
    } else {
        markers[deliveryPersonId].setPosition(position);
    }

    // Center map on the delivery person's location
    map.setCenter(position);
}

// Update delivery status in the UI
function updateDeliveryStatus(orderId, status) {
    const statusElement = document.getElementById(`order-${orderId}-status`);
    if (statusElement) {
        statusElement.textContent = status;
    }
}

// Handle initial data received from WebSocket
function handleInitialData(data) {
    // Clear existing markers
    Object.values(markers).forEach(marker => marker.setMap(null));
    markers = {};

    // Add markers for all active deliveries
    data.activeDeliveries.forEach(delivery => {
        updateDeliveryLocation(delivery.deliveryPersonId, delivery.location);
        updateDeliveryStatus(delivery.orderId, delivery.status);
    });
}

// Send location update to server
function sendLocationUpdate(location) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'location_update',
            location: location
        }));
    }
}

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