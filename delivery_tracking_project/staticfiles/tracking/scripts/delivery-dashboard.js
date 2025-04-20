// Sample delivery data
const deliveries = [
    { id: "ORD1234", status: "In Transit", partner: "DHL", location: "New York" },
    { id: "ORD5678", status: "Delivered", partner: "FedEx", location: "Los Angeles" },
    { id: "ORD9101", status: "Delayed", partner: "UPS", location: "Chicago" },
    { id: "ORD1121", status: "In Transit", partner: "Amazon", location: "San Francisco" }
];

const tableBody = document.getElementById("deliveryTable");

// Function to populate the table
function populateTable() {
    tableBody.innerHTML = "";
    deliveries.forEach(delivery => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${delivery.id}</td>
            <td><span class="status ${delivery.status.toLowerCase().replace(" ", "-")}">${delivery.status}</span></td>
            <td>${delivery.partner}</td>
            <td>${delivery.location}</td>
            <td><button onclick="trackDelivery('${delivery.id}')">Track</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Search and filter function
function filterTable() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    tableBody.innerHTML = "";
    deliveries
        .filter(delivery => 
            (delivery.id.toLowerCase().includes(searchInput) || searchInput === "") &&
            (delivery.status === statusFilter || statusFilter === "")
        )
        .forEach(delivery => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${delivery.id}</td>
                <td><span class="status ${delivery.status.toLowerCase().replace(" ", "-")}">${delivery.status}</span></td>
                <td>${delivery.partner}</td>
                <td>${delivery.location}</td>
                <td><button onclick="trackDelivery('${delivery.id}')">Track</button></td>
            `;
            tableBody.appendChild(row);
        });
}

// Simulated real-time updates (WebSocket simulation)
function simulateRealTimeUpdates() {
    setInterval(() => {
        const index = Math.floor(Math.random() * deliveries.length);
        const newStatus = ["In Transit", "Delivered", "Delayed"][Math.floor(Math.random() * 3)];
        deliveries[index].status = newStatus;
        populateTable();
    }, 5000); // Updates every 5 seconds
}

// Track delivery (Placeholder function)
function trackDelivery(orderId) {
    alert(`Tracking details for ${orderId} will be implemented soon!`);
}

// Initialize
populateTable();
simulateRealTimeUpdates();