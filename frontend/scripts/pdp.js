document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'product-list.html';
        return;
    }

    fetchProductDetails(productId);
    setupEventListeners(productId);
});

function setupEventListeners(productId) {
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(productId, quantity);
    });

    document.getElementById('cart').addEventListener('click', () => {
        window.location.href = 'user-cart-page.html';
    });

    document.getElementById("increase").addEventListener("click", function() {
        let quantity = document.getElementById("quantity");
        quantity.textContent = parseInt(quantity.textContent) + 1;
    });

    document.getElementById("decrease").addEventListener("click", function() {
        let quantity = document.getElementById("quantity");
        let current = parseInt(quantity.textContent);
        if (current > 1) {
            quantity.textContent = current - 1;
        }
    });
}

function fetchProductDetails(productId) {
    fetch(`http://127.0.0.1:3000/users/api/products/${productId}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Product not found');
        }
        return response.json();
    })
    .then(product => {
        console.log('Product details:', product); // Debug log
        displayProductDetails(product);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load product details');
        window.location.href = 'product-list.html';
    });
}

function displayProductDetails(product) {
    document.getElementById('product-img').src = product.image || './images/default-product.jpg';
    document.getElementById('product-img').alt = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('farmer-name').textContent = `${product.farmer.firstName} ${product.farmer.lastName}`;
    document.getElementById('farmer-location').textContent = product.farmer.location;
    
    // Update quantity options based on available stock
    const quantitySelect = document.getElementById('quantity');
    quantitySelect.innerHTML = '';
    for (let i = 1; i <= Math.min(5, product.quantity); i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }
}

function addToCart(productId, quantity) {
    fetch('http://127.0.0.1:3000/users/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity })
    })
    .then(response => response.json())
    .then(data => {
        alert('Product added to cart!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add product to cart');
    });
}
