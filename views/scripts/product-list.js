document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');

    // Placeholder data 
    const products = [
        { image: './images/potato.jpg', name: 'Potato', description: 'Description 1', price: 'Rs.69' },
        { image: './images/tomato.jpg', name: 'Tomato', description: 'Description 2', price: 'Rs.19' },
        { image: './images/carrot.jpg', name: 'Carrot', description: 'Description 3', price: 'Rs.49' },
        { image: './images/fresh-brinjal.jpg', name: 'Brinjal', description: 'Description 4', price: 'Rs.59' },
    ];

    // Function to create product cards
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
            <button>Quick View</button> 
        `;
        return card;
    }

    // Add product cards to the list
    products.forEach(product => {
        const card = createProductCard(product);
        productList.appendChild(card);
    });
});