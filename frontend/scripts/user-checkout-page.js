document.querySelector('.btn-complete').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
  
    // Basic validation
    if (!name || !email || !address || !city || !state || !zip || !cardNumber || !expiry || !cvv) {
      alert('Please fill out all the fields!');
      return;
    }
  
    alert('Purchase complete! Thank you for your order.');
  });

//payment details

  document.getElementById('cash').addEventListener('click', function() {
    document.querySelector('.razorpay-payment').classList.add('hidden');
  });
  
  document.getElementById('online-payment').addEventListener('click', function() {
    document.querySelector('.razorpay-payment').classList.remove('hidden');
  });
  
  document.querySelector('.btn-complete').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
  
    const paymentMethod = document.querySelector('input[name="payment"]:checked').id;
  
    // Basic validation
    if (!name || !email || !address || !city || !state || !zip) {
      alert('Please fill out all the fields!');
      return;
    }
  
    // If Razorpay payment is selected, check credit card fields
    if (paymentMethod === 'online-payment') {
      const cardNumber = document.getElementById('card-number').value;
      const expiry = document.getElementById('expiry').value;
      const cvv = document.getElementById('cvv').value;
  
      if (!cardNumber || !expiry || !cvv) {
        alert('Please fill out the credit card information for Razorpay payment.');
        return;
      }
    }

    if (paymentMethod === 'cash') {
      alert('Order placed successfully with Cash on Delivery!');
    } else if (paymentMethod === 'online-payment') {
      alert('Proceeding with Razorpay payment...');
      // Call Razorpay API here
    }
  });
  
  