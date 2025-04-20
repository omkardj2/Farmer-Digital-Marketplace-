<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Tracking</title>
    <link rel="stylesheet" href="{% static 'stylesheets/delivery-trackMap-page.css' %}">
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
</head>
<body>
    <div class="container">
        <h1>Delivery Tracking</h1>
        
        <div class="status-info">
            <p><strong>Order ID:</strong> <span id="orderID">ORD1234</span></p>
            <p><strong>Status:</strong> <span id="status">On the way</span></p>
        </div>

        <div id="map"></div>

        <button id="goBack">Back to Dashboard</button>
    </div>

    <script>
        // Parse the delivery data passed from Django view
        const deliveryData = JSON.parse('{{ delivery_data|safe }}'); // Passed as context from Django

        // Initialize map with the first delivery location as the center
        const map = L.map('map').setView([deliveryData[0].lat, deliveryData[0].lng], 13);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Loop through delivery data and add markers to the map
        const markers = [];
        deliveryData.forEach(function(delivery) {
            const marker = L.marker([delivery.lat, delivery.lng])
                .addTo(map)
                .bindPopup(`
                    <b>Delivery ID:</b> ${delivery.id}<br>
                    <b>Status:</b> ${delivery.status}
                `);
            markers.push(marker);
        });

        // Function to simulate real-time updates (can be replaced by real API/WebSocket)
        function updateLocation() {
            markers.forEach(function(marker, index) {
                const delivery = deliveryData[index];
                const lat = delivery.lat + (Math.random() - 0.5) * 0.02;  // Simulate random movement
                const lng = delivery.lng + (Math.random() - 0.5) * 0.02;

                marker.setLatLng([lat, lng])
                    .bindPopup(`
                        <b>Delivery ID:</b> ${delivery.id}<br>
                        <b>Status:</b> ${delivery.status}
                    `)
                    .openPopup();
                
                // Simulate random status update (this can be dynamically updated from the backend)
                const statuses = ["On the way", "Delayed", "Delivered"];
                delivery.status = statuses[Math.floor(Math.random() * statuses.length)];
                document.getElementById("status").innerText = delivery.status;
            });
        }

        // Simulate real-time updates every 5 seconds
        setInterval(updateLocation, 5000);

        // Back button function to navigate back to dashboard
        document.getElementById('goBack').addEventListener('click', function() {
            window.location.href = '/delivery/dashboard/'; // Make sure this is the correct URL
        });
    </script>

    <script src="{% static 'scripts/delivery-trackMap-page.js' %}"></script>
</body>
</html>
