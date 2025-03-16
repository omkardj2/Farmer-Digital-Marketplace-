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
