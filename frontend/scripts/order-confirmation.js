document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Get order ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id');
      
      if (!orderId) {
        throw new Error('No order ID provided');
      }
  
      // Fetch order details from backend
      const order = await fetchOrderDetails(orderId);
      console.log(order);
      
      // Render confirmation page
      renderConfirmationPage(order);
      
      // Clear cart if this is a new order
      clearCartIfNewOrder(orderId);
  
    } catch (error) {
      console.error('Order confirmation error:', error);
      showErrorState();
      showToast('Failed to load order details', 'error');
    }
  });
  
  async function fetchOrderDetails(orderId) {
    const response = await fetch(`http://127.0.0.1:3000/users/orders/${orderId}`, {
      credentials: 'include'
    });

  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }
  
  function renderConfirmationPage(order) {
    const container = document.querySelector('.confirmation-container');
    
    container.innerHTML = `
      <div class="confirmation-header">
        <div class="icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Thank You for Your Order!</h1>
        <p class="order-number">Order #${order._id.slice(-6).toUpperCase()}</p>
      </div>
  
      <div class="confirmation-details">
        <p>We've received your order and are preparing it for shipment.</p>
        <p class="order-date">Order placed: ${new Date(order.date).toLocaleString()}</p>
        <p class="delivery-date">Estimated delivery: ${new Date(order.date).toLocaleDateString()}</p>
      </div>
  
      <div class="order-summary">
        <h2>Order Summary</h2>
        <ul class="order-items">
          ${order.items.map(item => `
            <li class="order-item">
              <span class="item-quantity">${item.quantity} ×</span>
              <span class="item-name">${item.product.name}</span>
              <span class="item-price">₹${(item.product.price * item.quantity).toFixed(2)}</span>
            </li>
          `).join('')}
        </ul>
        <div class="order-totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping</span>
            <span>₹${order.shippingFee.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
  
      <div class="actions">
        <a href="product-list.html" class="btn btn-primary">
          <i class="fas fa-shopping-bag"></i> Continue Shopping
        </a>
        <a href="user-dashboard.html#orders" class="btn btn-secondary">
          <i class="fas fa-clipboard-list"></i> View Order History
        </a>
      </div>
    `;
  }
  
  function clearCartIfNewOrder(orderId) {
    // Check if this is a fresh order confirmation
    const freshOrder = sessionStorage.getItem('freshOrder');
    if (freshOrder === orderId) {
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      sessionStorage.removeItem('freshOrder');
    }
  }
  
  function showErrorState() {
    const container = document.querySelector('.confirmation-container');
    container.innerHTML = `
      <div class="error-state">
        <div class="icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1>Order Not Found</h1>
        <p>We couldn't retrieve your order details. Please check your order history or contact support.</p>
        <div class="actions">
          <a href="my-orders.html" class="btn btn-primary">View Order History</a>
          <a href="product-list.html" class="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    `;
  }
  
  function showToast(message, type = 'success') {   
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: type === 'success' ? "#4CAF50" : "#f44336",
    }).showToast();
  }
  
  // For testing purposes - would be called from checkout page
  function simulateCheckout() {
    // This would be called from your checkout process
    const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
    sessionStorage.setItem('freshOrder', orderId);
    window.location.href = `order-confirmation.html?orderId=${orderId}`;
  }