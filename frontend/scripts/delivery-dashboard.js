document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadActiveDeliveries();
    setupEventListeners();
    startLocationTracking();
});

let map;
let markers = [];
let userMarker;
let watchId;

function initializeMap() {
    map = L.map('delivery-map').setView([20.5937, 78.9629], 5); // Default to India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add user location marker
    userMarker = L.marker([0, 0], {
        icon: L.divIcon({
            className: 'delivery-person-marker',
            html: '<i class="fas fa-motorcycle"></i>',
            iconSize: [30, 30]
        })
    });
}

function startLocationTracking() {
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                
                // Update marker on map
                userMarker.setLatLng([latitude, longitude]).addTo(map);
                
                // Send location to server
                try {
                    await fetch('http://127.0.0.1:3000/delivery/update-location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ latitude, longitude }),
                        credentials: 'include'
                    });
                } catch (error) {
                    console.error('Error updating location:', error);
                }
            },
            error => {
                console.error('Error getting location:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

async function loadActiveDeliveries() {
    try {
        const response = await fetch('http://127.0.0.1:3000/delivery/active', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load active deliveries');
        }

        const deliveries = await response.json();
        displayDeliveries(deliveries);
        updateMapMarkers(deliveries);
    } catch (error) {
        console.error('Error loading deliveries:', error);
    }
}

function displayDeliveries(deliveries) {
    const container = document.getElementById('active-deliveries-list');
    container.innerHTML = '';

    deliveries.forEach(delivery => {
        const card = document.createElement('div');
        card.className = 'delivery-card';
        card.innerHTML = `
            <h4>Order #${delivery.order_id}</h4>
            <p><strong>Customer:</strong> ${delivery.customer_name}</p>
            <p><strong>Address:</strong> ${delivery.delivery_address}</p>
            <p><strong>Status:</strong> ${delivery.status}</p>
            <button onclick="showDeliveryConfirmation('${delivery.order_id}', '${delivery.customer_name}', '${delivery.delivery_address}')">
                Confirm Delivery
            </button>
        `;
        container.appendChild(card);
    });
}

function updateMapMarkers(deliveries) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    deliveries.forEach(delivery => {
        if (delivery.latitude && delivery.longitude) {
            const marker = L.marker([delivery.latitude, delivery.longitude])
                .addTo(map)
                .bindPopup(`
                    <strong>Order #${delivery.order_id}</strong><br>
                    ${delivery.customer_name}<br>
                    ${delivery.delivery_address}
                `);
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds());
    }
}

function showDeliveryConfirmation(orderId, customerName, address) {
    const modal = document.getElementById('delivery-confirmation-modal');
    document.getElementById('modal-order-id').textContent = orderId;
    document.getElementById('modal-customer-name').textContent = customerName;
    document.getElementById('modal-delivery-address').textContent = address;
    modal.style.display = 'block';
}

function setupEventListeners() {
    // Close modal when clicking the close button
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('delivery-confirmation-modal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('delivery-confirmation-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle delivery confirmation
    document.getElementById('confirm-delivery-btn').addEventListener('click', async () => {
        const orderId = document.getElementById('modal-order-id').textContent;
        const otp = document.getElementById('delivery-otp').value;

        try {
            const response = await fetch('http://127.0.0.1:3000/delivery/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: orderId,
                    otp: otp
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to confirm delivery');
            }

            // Close modal and refresh deliveries
            document.getElementById('delivery-confirmation-modal').style.display = 'none';
            loadActiveDeliveries();
        } catch (error) {
            console.error('Error confirming delivery:', error);
            alert('Failed to confirm delivery. Please check the OTP and try again.');
        }
    });

    // Handle navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (!item.classList.contains('logout')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                showSection(section);
            });
        }
    });

    // Handle logout
    document.querySelector('.logout').addEventListener('click', async () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
        try {
            const response = await fetch('http://127.0.0.1:3000/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = 'landP.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Load delivery history when switching to history tab
    document.querySelector('[data-section="delivery-history"]').addEventListener('click', loadDeliveryHistory);
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Deactivate all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section and activate nav item
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

async function loadDeliveryHistory() {
    try {
        const response = await fetch('http://127.0.0.1:3000/delivery/history', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load delivery history');
        }

        const history = await response.json();
        const tbody = document.querySelector('#delivery-history-table tbody');
        tbody.innerHTML = history.map(delivery => `
            <tr>
                <td>${delivery.order_id}</td>
                <td>${delivery.customer_name}</td>
                <td>${delivery.delivery_address}</td>
                <td><span class="status-badge ${delivery.status}">${delivery.status}</span></td>
                <td>${new Date(delivery.delivery_date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading delivery history:', error);
    }
} 