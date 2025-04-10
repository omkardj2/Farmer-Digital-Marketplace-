document.addEventListener('DOMContentLoaded', () => {
    // Dummy order data (replace this with API call or localStorage if needed)
    const order = {
        id: 'ORD123456',
        items: [
            { name: 'Organic Potatoes', quantity: 2, price: 20 },
            { name: 'Fresh Tomatoes', quantity: 1, price: 25 }
        ],
        shipping: 10
    };

    // Set order ID
    document.querySelector('.confirmation-container p strong').textContent = `#${order.id}`;

    // Render item list
    const itemList = document.querySelector('.summary ul');
    itemList.innerHTML = '';
    let total = 0;
    order.items.forEach(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        itemList.innerHTML += `<li>${item.quantity} × ${item.name} - ₹${itemTotal}</li>`;
    });

    // Add shipping
    itemList.innerHTML += `<li>Shipping - ₹${order.shipping}</li>`;
    total += order.shipping;

    // Show total
    document.querySelector('.summary .total').textContent = `Total: ₹${total}`;
});
