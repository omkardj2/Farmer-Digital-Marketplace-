function filterTable() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const table = document.getElementById('deliveryTable');
    const rows = table.getElementsByTagName('tr');

    for (let row of rows) {
        const orderIdCell = row.cells[0];
        const statusCell = row.cells[1];
        
        if (orderIdCell && statusCell) {
            const orderId = orderIdCell.textContent.toLowerCase();
            const status = statusCell.textContent.toLowerCase();
            
            const matchesSearch = orderId.includes(searchInput);
            const matchesStatus = statusFilter === '' || status === statusFilter;
            
            row.style.display = matchesSearch && matchesStatus ? '' : 'none';
        }
    }
}

// Initialize WebSocket connection for real-time updates
const ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
const deliverySocket = new WebSocket(
    ws_scheme + '://' + window.location.host + '/ws/delivery/updates/'
);

deliverySocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    updateDeliveryStatus(data);
};

function updateDeliveryStatus(data) {
    const table = document.getElementById('deliveryTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let row of rows) {
        const orderIdCell = row.cells[0];
        if (orderIdCell && orderIdCell.textContent === data.order_id) {
            row.cells[1].textContent = data.status;
            break;
        }
    }
} 