document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupEventListeners();
});

function setupEventListeners() {
    // Handle cart button click
    document.getElementById('cart').addEventListener('click', () => {
        window.location.href = 'user-cart-page.html';
    });

    // Handle search
    const searchInput = document.querySelector('.searchbar input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm);
    });

    // Handle clear filters
    document.querySelector('.clear-filters').addEventListener('click', () => {
        fetchProducts();
    });
}

function fetchProducts() {
    fetch('http://127.0.0.1:3000/users/api/products', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(products => {
        displayProducts(products);
    })
    .catch(err => {
        console.error('Error fetching products:', err);
        document.getElementById('product-list').innerHTML = 
            '<p class="error-message">Failed to load products. Please try again later.</p>';
    });
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p class="no-products">No products available.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || './images/default-product.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <p class="price">₹${product.price}</p>
                    <div class="product-actions">
                        <button class="quick-view" onclick="quickView('${product._id}')">Quick View</button>
                        <button class="add-to-cart" onclick="addToCart('${product._id}')">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        productList.innerHTML += productCard;
    });
}

function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.description').textContent.toLowerCase();
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function quickView(productId) {
    // Redirect to product detail page
    window.location.href = `pdp.html?id=${productId}`;
}

function addToCart(productId) {
    fetch('http://127.0.0.1:3000/users/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ productId: productId, quantity: 1 })
    })
    .then(response => response.json())
    .then(data => {
        alert('Product added to cart!');
    })
    .catch(err => {
        console.error('Error adding to cart:', err);
        alert('Failed to add product to cart. Please try again.');
    });
}