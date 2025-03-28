document.addEventListener('DOMContentLoaded', () => {
    fetchCartItems();
    setupPaymentForms();
    setupEventListeners();
});

function fetchCartItems() {
    fetch('http://127.0.0.1:3000/users/cart', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(items => {
        displayCartItems(items);
        updateTotals(items);
    })
    .catch(err => {
        console.error('Error fetching cart items:', err);
        alert('Failed to load cart items');
    });
}

function displayCartItems(items) {
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = '';

    items.forEach(item => {
        const itemHTML = `
            <div class="cart-item">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });
}

function updateTotals(items) {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 40.00;
    const total = itemsTotal + deliveryFee;

    document.getElementById('items-total').textContent = `₹${itemsTotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `₹${deliveryFee.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
}

function setupPaymentForms() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const upiForm = document.getElementById('upi-form');
    const cardForm = document.getElementById('card-form');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            // Hide all payment forms
            upiForm.classList.add('hidden');
            cardForm.classList.add('hidden');

            // Show selected payment form
            if (e.target.value === 'upi') {
                upiForm.classList.remove('hidden');
            } else if (e.target.value === 'card') {
                cardForm.classList.remove('hidden');
            }
        });
    });
}

function setupEventListeners() {
    const placeOrderBtn = document.getElementById('place-order');
    const deliveryForm = document.getElementById('delivery-form');

    placeOrderBtn.addEventListener('click', () => {
        if (!validateForm()) {
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        if (paymentMethod === 'upi' && !validateUPI()) {
            return;
        }
        if (paymentMethod === 'card' && !validateCard()) {
            return;
        }

        placeOrder();
    });
}

function validateForm() {
    const requiredFields = ['name', 'phone', 'address', 'city', 'pincode'];
    let isValid = true;

    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            alert(`Please enter your ${field}`);
            isValid = false;
        }
    });

    return isValid;
}

function validateUPI() {
    const upiId = document.getElementById('upi-id').value;
    if (!upiId.includes('@')) {
        alert('Please enter a valid UPI ID');
        return false;
    }
    return true;
}

function validateCard() {
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || !expiry || !cvv) {
        alert('Please fill all card details');
        return false;
    }
    return true;
}

function placeOrder() {
    const orderData = {
        deliveryDetails: {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value
        },
        paymentMethod: document.querySelector('input[name="payment"]:checked').value
    };

    fetch('http://127.0.0.1:3000/api/orders/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Order placed successfully!');
        window.location.href = 'order-confirmation.html?id=' + data.orderId;
    })
    .catch(err => {
        console.error('Error placing order:', err);
        alert('Failed to place order. Please try again.');
    });
}

