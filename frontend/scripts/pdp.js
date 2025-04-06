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

async function loadProductDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            throw new Error('Product ID not found');
        }

        const imageContainer = document.querySelector('.product-image');
        imageContainer.innerHTML = '<div class="loading-spinner"></div>';

        const response = await fetch(`http://127.0.0.1:3000/products/${productId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();

        // Create image element with proper URL handling
        const img = document.createElement('img');
        
        // Fix the image URL to point to the backend uploads directory
        const imageUrl = product.image ? 
            (product.image.startsWith('http') ? product.image : 
             `http://127.0.0.1:5500/Farmer-Digital-Marketplace-/backend/uploads/products/${product.image.split('/').pop()}`) : 
            './images/default-product.jpg';
        
        img.src = imageUrl;
        img.alt = product.name;
        img.onerror = () => {
            img.src = './images/default-product.jpg';
            console.error('Failed to load image:', imageUrl);
        };

        // Update product details
        document.querySelector('.product-details h1').textContent = product.name;
        document.querySelector('.price').textContent = `₹${product.price.toFixed(2)}`;
        document.querySelector('.product-description').textContent = product.description;
        
        if (product.farmer) {
            document.querySelector('.farmer-info').innerHTML = `
                <h3>Seller Information</h3>
                <p>Farmer: ${product.farmer.firstName} ${product.farmer.lastName}</p>
                <p>Location: ${product.farmer.location}</p>
            `;
        }

        // Clear loading spinner and add image
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);

        // Update page title
        document.title = `${product.name} - GreenBasket`;

    } catch (error) {
        console.error('Error loading product:', error);
        const imageContainer = document.querySelector('.product-image');
        imageContainer.innerHTML = `
            <div class="error-message">
                Failed to load product image
                <button onclick="loadProductDetails()" class="retry-btn">Retry</button>
            </div>
        `;
        showToast('Failed to load product details', 'error');
    }
}

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
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
