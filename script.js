// Cart functionality
let cart = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing cart...');
    attachEventListeners();
    loadCartFromStorage();
    updateCart();
});

// Attach event listeners for cart sidebar
function attachEventListeners() {
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const modalOverlay = document.getElementById('modal-overlay');

    if (cartToggle) {
        cartToggle.addEventListener('click', openCart);
        console.log('Cart toggle attached');
    }
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
        console.log('Close cart button attached');
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            closeCartSidebar();
        });
    }
}

// Open cart sidebar
function openCart() {
    console.log('Opening cart...');
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.add('open');
        console.log('Cart opened');
    }
}

// Close cart sidebar
function closeCartSidebar() {
    console.log('Closing cart...');
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
        console.log('Cart closed');
    }
}

// Add to cart
function addToCart(id, productName, price) {
    console.log('Adding to cart:', productName, price);
    cart.push({
        id: id,
        name: productName,
        price: price,
        uniqueId: Date.now() + Math.random()
    });
    saveCartToStorage();
    updateCart();
    showNotification(`${productName} added to cart!`);
    openCart();
}

// Remove from cart
function removeFromCart(itemId) {
    console.log('Removing item:', itemId);
    cart = cart.filter(item => item.uniqueId !== itemId);
    saveCartToStorage();
    updateCart();
}

// Update cart display
function updateCart() {
    console.log('Updating cart, items:', cart.length);
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const totalPriceSpan = document.getElementById('total-price');

    if (!cartItemsDiv || !cartCountSpan || !totalPriceSpan) {
        console.error('Cart elements not found!');
        return;
    }

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
    console.log('Cart saved to storage:', cart);
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded from storage:', cart);
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            cart = [];
        }
    }
}

// Show notification
function showNotification(message) {
    console.log('Showing notification:', message);
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
