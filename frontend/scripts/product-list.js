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
        console.log(product);
        const productCard = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" 
                         alt="${product.name}"
                         onerror="this.src='./images/default-product.jpg'">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    
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
        showToast('Product added to cart!', 'success');
    })
    .catch(err => {
        console.error('Error adding to cart:', err);
        showToast('Failed to add product to cart. Please try again.', 'error');
    });
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // Toast disappears after 3 seconds
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '1000';
    document.body.appendChild(container);
    return container;
}