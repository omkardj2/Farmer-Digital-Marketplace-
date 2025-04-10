document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'product-list.html';
        return;
    }

    loadProductDetails();
    setupEventListeners(productId);
});

function setupEventListeners(productId) {
    // Add to cart button
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(productId, quantity);
    });

    // Cart navigation
    document.getElementById('cart').addEventListener('click', () => {
        window.location.href = 'user-cart-page.html';
    });

    // Quantity selector
    const quantitySelect = document.getElementById('quantity');
    if (quantitySelect) {
        // You can dynamically populate more options if needed
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            quantitySelect.appendChild(option);
        }
    }
}

async function loadProductDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            throw new Error('Product ID not found');
        }

        // Show loading spinner
        const imageContainer = document.querySelector('.product-image');
        if (!imageContainer) {
            throw new Error('Product image container not found');
        }
        imageContainer.innerHTML = '<div class="loading-spinner"></div>';

        const response = await fetch(`http://127.0.0.1:3000/api/products/${productId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();
        console.log('Product data:', product); // Debug log

        // Create and configure the image element
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.onerror = () => {
            img.src = './images/default-product.jpg';
            console.error('Failed to load product image');
        };

        // Update product details - with null checks
        const productName = document.querySelector('.product-details h1');
        const productPrice = document.querySelector('.price');
        const productDescription = document.querySelector('.product-description');
        const farmerInfo = document.querySelector('.farmer-info');

        if (productName) productName.textContent = product.name;
        if (productPrice) productPrice.textContent = `₹${product.price.toFixed(2)}`;
        if (productDescription) productDescription.textContent = product.description;

        // Update farmer information
        if (farmerInfo && product.farmer) {
            farmerInfo.innerHTML = `
                <h3>Seller Information</h3>
                <p>Farmer: ${product.farmer.firstName} ${product.farmer.lastName}</p>
                <p>Location: ${product.farmer.location || 'Location not available'}</p>
            `;
        }

        // Clear loading spinner and add image
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);

        // Update page title
        document.title = `${product.name} - GreenBasket`;

        // Enable/disable add to cart button based on stock
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn && product.quantity <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
        }

    } catch (error) {
        console.error('Error loading product:', error);
        const imageContainer = document.querySelector('.product-image');
        if (imageContainer) {
            imageContainer.innerHTML = `
                <div class="error-message">
                    Failed to load product image
                    <button onclick="loadProductDetails()" class="retry-btn">Retry</button>
                </div>
            `;
        }
        showToast('Failed to load product details', 'error');
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add to cart');
        }
        return response.json();
    })
    .then(data => {
        showToast('Product added to cart!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to add product to cart', 'error');
    });
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility function to handle fetch errors
function handleFetchError(error) {
    console.error('Fetch error:', error);
    showToast(error.message || 'An error occurred', 'error');
}
