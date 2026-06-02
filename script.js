// Cart functionality
let cart = [];
let stripe, elements, paymentElement;

// Initialize Stripe - IMPORTANT: Replace with your actual publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';

// Initialize Stripe when page loads
document.addEventListener('DOMContentLoaded', function() {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    initializeStripe();
    attachEventListeners();
    updateCart();
});

// Attach event listeners for cart sidebar and modal
function attachEventListeners() {
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const closeCheckout = document.querySelector('.close-modal');
    const modalOverlay = document.getElementById('modal-overlay');

    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCart);
    
    if (closeCheckout) {
        closeCheckout.addEventListener('click', closeCheckoutModal);
    }
    
    modalOverlay.addEventListener('click', function() {
        if (document.getElementById('checkout-modal').classList.contains('show')) {
            closeCheckoutModal();
        }
    });

    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
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
function addToCart(productName, price) {
    cart.push({
        name: productName,
        price: price,
        id: Date.now()
    });
    updateCart();
    showNotification(`${productName} added to cart!`);
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
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
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
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
        updateCart();
        showNotification('Cart cleared!');
    }
}

// Open checkout modal
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    closeCartSidebar();
    displayOrderSummary();
    
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('modal-overlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const overlay = document.getElementById('modal-overlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

// Display order summary in checkout
function displayOrderSummary() {
    const orderItemsDiv = document.getElementById('order-items');
    const checkoutTotalSpan = document.getElementById('checkout-total');

    let orderHTML = '';
    let total = 0;

    cart.forEach(item => {
        orderHTML += `
            <div class="order-item">
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `;
        total += item.price;
    });

    orderItemsDiv.innerHTML = orderHTML;
    checkoutTotalSpan.textContent = total.toFixed(2);
}

// Initialize Stripe Payment Element
async function initializeStripe() {
    try {
        // Create payment intent on your backend
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 0 }) // Will be updated on checkout
        });

        const { clientSecret } = await response.json();

        elements = stripe.elements({ clientSecret });
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
}

// Handle payment
async function handlePayment(e) {
    e.preventDefault();

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const amount = Math.round(total * 100); // Convert to cents

    try {
        // Create payment intent with cart total
        const intentResponse = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        const { clientSecret } = await intentResponse.json();

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            redirect: 'if_required'
        });

        const messageContainer = document.getElementById('payment-message');

        if (error) {
            messageContainer.textContent = error.message;
            messageContainer.classList.remove('success');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            messageContainer.textContent = 'Payment successful! Thank you for your purchase.';
            messageContainer.classList.add('success');
            
            // Clear cart and close modal after 2 seconds
            setTimeout(() => {
                cart = [];
                updateCart();
                closeCheckoutModal();
                showNotification('Order placed successfully!');
                document.getElementById('payment-form').reset();
            }, 2000);
        }
    } catch (error) {
        const messageContainer = document.getElementById('payment-message');
        messageContainer.textContent = 'Payment failed. Please try again.';
        messageContainer.classList.remove('success');
        console.error('Payment error:', error);
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
