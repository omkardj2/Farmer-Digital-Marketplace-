document.addEventListener("DOMContentLoaded", () => {
    fetchFarmerInfo();
    fetchFarmerProducts();
    setupEventListeners();
});

// ✅ Fetch Farmer Info with Cookies
function fetchFarmerInfo() {
    fetch('http://127.0.0.1:3000/api/farmer-info', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch farmer info');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('farmer-firstname').textContent = data.firstName;
        document.getElementById('farmer-lastname').textContent = data.lastName;
        document.getElementById('farmer-email').textContent = data.email;
        document.getElementById('farmer-contact').textContent = data.contact;
        document.getElementById('farmer-location').textContent = data.location;
        
        // Also populate edit form
        document.getElementById('edit-firstname').value = data.firstName;
        document.getElementById('edit-lastname').value = data.lastName;
        document.getElementById('edit-email').value = data.email;
        document.getElementById('edit-contact').value = data.contact;
        document.getElementById('edit-location').value = data.location;
    })
    .catch(err => console.error("Error fetching farmer info:", err));
}


// ✅ Fetch Farmer Products with Cookies
function fetchFarmerProducts() {
    fetch('http://127.0.0.1:3000/api/products', {
        method: 'GET',
        credentials: 'include'  // ✅ Send cookies with the request
    })
    .then(response => response.json())
    .then(data => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';  

        if (data.length === 0) {
            productList.innerHTML = `<p>No products found.</p>`;
            return;
        }

        data.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <img src="${product.image || './images/default-product.png'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>Price: ₹${product.price}</p>
                    <p>Quantity: ${product.quantity}</p>
                </div>
            `;
            productList.innerHTML += productCard;
        });
    })
    .catch(err => console.error("Error fetching products:", err));
}


// ✅ Function to Read Cookie
function getCookie(name) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return value;
    }
    return null;
}


// ✅ Modal & Event Handlers
function setupEventListeners() {
    // Add Product Modal
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const closeAddModalBtn = addProductModal.querySelector('.close-btn');

    addProductBtn.addEventListener('click', () => {
        addProductModal.style.display = 'block';
    });

    closeAddModalBtn.addEventListener('click', () => {
        addProductModal.style.display = 'none';
    });

    // Edit Profile Modal
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModalBtn = document.getElementById('close-edit-btn');

    editProfileBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'block';
    });

    closeEditModalBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === addProductModal) {
            addProductModal.style.display = 'none';
        }
        if (event.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    // Form submissions
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addNewProduct();
    });

    const editProfileForm = document.getElementById('edit-profile-form');
    editProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateProfile();
    });
}

// ✅ Add New Product with Cookies
function addNewProduct() {
    const formData = {
        name: document.getElementById('product-name').value,
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value)
    };

    fetch('http://127.0.0.1:3000/api/addProduct', {   
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',  // ✅ Send cookies with the request
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(() => {
        alert('Product added successfully!');
        document.getElementById('add-product-modal').style.display = 'none';
        document.getElementById('add-product-form').reset();
        fetchFarmerProducts();
    })
    .catch(err => console.error("Error adding product:", err));
}

// ✅ Update Profile Function
function updateProfile() {
    const formData = {
        firstName: document.getElementById('edit-firstname').value,
        lastName: document.getElementById('edit-lastname').value,
        email: document.getElementById('edit-email').value,
        contact: document.getElementById('edit-contact').value,
        location: document.getElementById('edit-location').value
    };

    fetch('http://127.0.0.1:3000/api/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(() => {
        alert('Profile updated successfully!');
        document.getElementById('edit-profile-modal').style.display = 'none';
        fetchFarmerInfo();
    })
    .catch(err => console.error("Error updating profile:", err));
}