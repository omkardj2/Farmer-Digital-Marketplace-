document.addEventListener('DOMContentLoaded', () => {
    fetchCartItems();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('home').addEventListener('click', () => {
        window.location.href = 'product-list.html';
    });

    document.getElementById('pay-btn').addEventListener('click', () => {
        window.location.href = 'user-checkout-page.html';
    });
}

async function fetchCartItems() {
    try {
        const response = await fetch('http://127.0.0.1:3000/users/cart', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const items = await response.json();
        console.log(items);

        const safeItems = Array.isArray(items) ? items : [];
        displayCartItems(safeItems);
        updateTotal(safeItems);

    } catch (err) {
        console.error('Error fetching cart items:', err);
        alert('Failed to load cart items');
    }
}



function displayCartItems(items = []) {
    const productsContainer = document.querySelector('.products');
    productsContainer.innerHTML = '';

    if (!items.length) {
        productsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    items.forEach(item => {
        const productHTML = `
            <div class="product" data-id="${item._id}">
                <img src="${item.image || './images/default-product.jpg'}" alt="${item.name}">
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price}</p>
                    <p class="quantity">Quantity: ${item.quantity}</p>
                    <div class="product-actions">
                        <button class="quick-view" onclick="quickView('${item._id}')">Quick view</button>
                        <button class="remove" onclick="removeFromCart('${item._id}')">Remove</button>
                    </div>
                </div>
            </div>
        `;
        productsContainer.innerHTML += productHTML;
    });
}



function updateTotal(items) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.querySelector('#pay h3').textContent = `Total: ₹${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    fetch(`http://127.0.0.1:3000/users/cart/remove/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(() => {
        fetchCartItems(); // Refresh cart
    })
    .catch(err => {
        console.error('Error removing item:', err);
        alert('Failed to remove item from cart');
    });
}

function quickView(productId) {
    window.location.href = `pdp.html?id=${productId}`;
}
