// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 13); // Default: San Francisco

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Delivery Partner Marker
const marker = L.marker([37.7749, -122.4194]).addTo(map)
    .bindPopup("Delivery Partner is here")
    .openPopup();

// Function to simulate real-time updates (API/WebSocket)
function updateLocation() {
    // Simulated API response (Random location shift)
    const lat = 37.7749 + (Math.random() - 0.5) * 0.02;
    const lng = -122.4194 + (Math.random() - 0.5) * 0.02;

    // Update marker position
    marker.setLatLng([lat, lng])
        .bindPopup("Delivery Partner is here")
        .openPopup();

    // Update delivery status randomly
    const statuses = ["On the way", "Delayed", "Delivered"];
    document.getElementById("status").innerText = statuses[Math.floor(Math.random() * statuses.length)];
}

// Simulate real-time updates every 5 seconds
setInterval(updateLocation, 5000);

// Back button function
// function goBack() {
//     window.history.back();
// }

document.getElementById('goBack').addEventListener('click', function() {
    window.location.href='http://127.0.0.1:5500/Farmer-Digital-Marketplace-/frontend/delivery-dashboard.html'; 
});
  