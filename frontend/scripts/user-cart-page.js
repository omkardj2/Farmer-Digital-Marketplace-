const payButton = document.getElementById('.pay-btn');
const removeButton = document.querySelectorAll('.remove');

//quick view --> product detail page opens
document.getElementById('quick-view').addEventListener('click', function() {
    window.location.href='http://127.0.0.1:5500/Farmer-Digital-Marketplace-/frontend/pdp.html'; 
});

document.getElementById('pay-btn').addEventListener('click', function() {
    window.location.href='http://127.0.0.1:5500/Farmer-Digital-Marketplace-/frontend/user-checkout-page.html'; 
});
  

removeButton.forEach(button => {
    button.addEventListener('click', () => {
        alert('Removed from cart');
    });
});

payButton.addEventListener('click', () => {
    alert('Proceeding to payment');
});
