// Cart functionality
let cart = [];

function addToCart(productName, price) {
    cart.push({
        name: productName,
        price: price,
        id: Date.now()
    });
    updateCart();
    showNotification(`${productName} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');

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
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
        total += item.price;
    });

    cartItemsDiv.innerHTML = cartHTML;
    totalPriceSpan.textContent = total.toFixed(2);
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty!');
        return;
    }
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        updateCart();
        showNotification('Cart cleared!');
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartSummary = cart.map(item => `${item.name}: $${item.price.toFixed(2)}`).join('\n');
    
    alert(`Order Summary:\n\n${cartSummary}\n\nTotal: $${total.toFixed(2)}\n\nThank you for your purchase!\nPlease check your email for order confirmation.`);
    
    // Clear cart after checkout
    cart = [];
    updateCart();
    showNotification('Order placed successfully!');
}

function showNotification(message) {
    // Create a simple notification
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

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showNotification('Thank you! Your message has been sent.');
        this.reset();
    });
}

// Initialize cart display
updateCart();