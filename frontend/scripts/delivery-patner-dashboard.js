// Sample delivery data
const deliveries = [
    { id: "ORD1234", status: "Picked Up" },
    { id: "ORD5678", status: "In Transit" }
];

const tableBody = document.getElementById("deliveryTable");

// Function to populate the table
function populateTable() {
    tableBody.innerHTML = "";
    deliveries.forEach((delivery, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${delivery.id}</td>
            <td><span class="status">${delivery.status}</span></td>
            <td><button onclick="updateStatus(${index})">Update Status</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to update status
function updateStatus(index) {
    if (deliveries[index].status === "Picked Up") {
        deliveries[index].status = "Delivered";
    } else {
        deliveries[index].status = "Picked Up";
    }
    populateTable();
}

// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 13); // Default location

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker
const marker = L.marker([37.7749, -122.4194]).addTo(map)
    .bindPopup("Delivery Partner Location")
    .openPopup();

// Simulate real-time tracking
function updateLocation() {
    const lat = 37.7749 + (Math.random() - 0.5) * 0.02;
    const lng = -122.4194 + (Math.random() - 0.5) * 0.02;
    marker.setLatLng([lat, lng]).openPopup();
}

setInterval(updateLocation, 5000);
populateTable();
