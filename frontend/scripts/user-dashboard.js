// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Sample product data (replace with API data)
    const products = [
        { image: './images/placeholder-product.jpg', name: 'Product A', price: '$25.00', quantity: 100 },
        { image: './images/placeholder-product.jpg', name: 'Product B', price: '$15.00', quantity: 50 },
        // ... more products
    ];

    // Sample order data (replace with API data)
    const orders = [
        { id: '#12345', customer: 'John Doe', date: '2024-07-20', total: '$50.00', status: 'Shipped' },
        { id: '#67890', customer: 'Jane Smith', date: '2024-07-21', total: '$7