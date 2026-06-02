// Cart functionality
let cart = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
    loadCartFromStorage();
    updateCart();
});

// Attach event listeners for cart sidebar
function attachEventListeners() {
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const modalOverlay = document.getElementById('modal-overlay');

    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    
    modalOverlay.addEventListener('click', function() {
        closeCartSidebar();
    });
}

// Open cart sidebar
function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.add('open');
}

// Close cart sidebar
function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('open');
}

// Add to cart
function addToCart(id, productName, price) {
    cart.push({
        id: id,
        name: productName,
        price: price,
        uniqueId: Date.now()
    });
    saveCartToStorage();
    updateCart();
    showNotification(`${productName} added to cart!`);
    openCart();
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.uniqueId !== itemId);
    saveCartToStorage();
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const totalPriceSpan = document.getElementById('total-price');

    cartCountSpan.textContent = cart.length;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPriceSpan.textContent = '0.00';
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach(item => {
        cartHTML += `
            <div class="cart-item">
                <div>
                    <span class="cart-item-name">${item.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    <button class="remove-item" onclick="removeFromCart(${item.uniqueId})">Remove</button>
                </div>
            </div>
        `;
        total += item.price;
    });

    cartItemsDiv.innerHTML = cartHTML;
    totalPriceSpan.textContent = total.toFixed(2);
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty!');
        return;
    }
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCartToStorage();
        updateCart();
        showNotification('Cart cleared!');
    }
}

// Go to checkout page
function goToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Save cart to localStorage for checkout page
    saveCartToStorage();
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            cart = [];
        }
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #FF6B35;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        font-weight: bold;
        letter-spacing: 1px;
    `;
    notification.textContent = message;
    notification.className = 'notification';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
