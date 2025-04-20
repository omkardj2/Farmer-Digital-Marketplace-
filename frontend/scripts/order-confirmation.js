document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadOrderDetails();
});

async function loadOrderDetails() {
    try {
        // Get order ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (!orderId) {
            window.location.href = 'user-dashboard.html';
            return;
        }

        // Display order ID
        document.getElementById('orderId').textContent = orderId;
        
        // Set up tracking button
        const trackButton = document.getElementById('trackOrderBtn');
        trackButton.href = `delivery-tracking.html?orderId=${orderId}`;

        // Load order details
        const response = await fetch(`http://127.0.0.1:3000/orders/${orderId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load order details');
        }

        const orderData = await response.json();
        displayOrderSummary(orderData);

        // Create delivery tracking entry
        await createDeliveryTracking(orderData);

    } catch (error) {
        console.error('Failed to load order details:', error);
        showError('Failed to load order details. Please check your order status in the dashboard.');
    }
}

function displayOrderSummary(orderData) {
    const summaryDiv = document.getElementById('orderSummary');
    
    const itemsList = orderData.items.map(item => `
        <div class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">×${item.quantity}</span>
            <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    summaryDiv.innerHTML = `
        <div class="items-list">
            ${itemsList}
        </div>
        <div class="order-total">
            <span>Total:</span>
            <span class="total-amount">₹${orderData.total.toFixed(2)}</span>
        </div>
    `;
}

async function createDeliveryTracking(orderData) {
    try {
        const response = await fetch('http://127.0.0.1:3000/delivery/create', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderData.orderId,
                customer_name: orderData.customerName,
                delivery_address: orderData.shippingAddress,
                status: 'pending'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create delivery tracking');
        }

    } catch (error) {
        console.error('Failed to create delivery tracking:', error);
        // Don't show error to user as this is a background operation
    }
}

function showError(message) {
    const container = document.querySelector('.confirmation-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Oops! Something went wrong</h2>
            <p>${message}</p>
            <a href="user-dashboard.html" class="button">
                Go to Dashboard
            </a>
        </div>
    `;
}
