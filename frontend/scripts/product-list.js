document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');

    // Function to create product cards
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image || './images/default-product.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: Rs. ${product.price}</p>
            <button>Quick View</button> 
        `;
        return card;
    }

    // Fetch products from the backend
    try {
        const response = await fetch('http://127.0.0.1:3000/users/getproducts');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();

        // Add product cards to the list
        products.forEach(product => {
            const card = createProductCard(product);
            productList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        productList.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
});