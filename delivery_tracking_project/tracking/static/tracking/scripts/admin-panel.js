const deliveries = [
    { id: "ORD1234", status: "In Transit" },
    { id: "ORD5678", status: "Delivered" },
    { id: "ORD9012", status: "Pending" }
];

const tableBody = document.getElementById("adminTable");

// Function to populate the table
function populateTable() {
    tableBody.innerHTML = "";
    let activeCount = 0;
    let completedCount = 0;

    deliveries.forEach((delivery, index) => {
        if (delivery.status !== "Delivered") activeCount++;
        else completedCount++;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${delivery.id}</td>
            <td><span class="status">${delivery.status}</span></td>
            <td>
                <button onclick="editStatus(${index})">Update</button>
                <button onclick="deleteDelivery(${index})" style="background: red;">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("totalDeliveries").innerText = deliveries.length;
    document.getElementById("activeDeliveries").innerText = activeCount;
    document.getElementById("completedDeliveries").innerText = completedCount;
}

// Function to update status
function editStatus(index) {
    const statuses = ["Pending", "In Transit", "Delivered", "Delayed"];
    const newStatus = prompt("Enter new status:", deliveries[index].status);
    if (statuses.includes(newStatus)) {
        deliveries[index].status = newStatus;
        populateTable();
    } else {
        alert("Invalid status!");
    }
}

// Function to delete delivery
function deleteDelivery(index) {
    deliveries.splice(index, 1);
    populateTable();
}

// Initialize map
const map = L.map('map').setView([37.7749, -122.4194], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = deliveries.map((_, i) =>
    L.marker([37.7749 + (Math.random() - 0.5) * 0.05, -122.4194 + (Math.random() - 0.5) * 0.05])
        .addTo(map)
        .bindPopup(`Delivery ${i + 1}`)
);

// Simulate real-time tracking
function updateLocation() {
    markers.forEach((marker) => {
        const lat = marker.getLatLng().lat + (Math.random() - 0.5) * 0.01;
        const lng = marker.getLatLng().lng + (Math.random() - 0.5) * 0.01;
        marker.setLatLng([lat, lng]);
    });
}

setInterval(updateLocation, 5000);

populateTable();