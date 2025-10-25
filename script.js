// Shopping cart functionality
let cart = [];
let quantity = 1;

// Global flag to disable site animations (parallax, tilt, stagger, RAF loops)
// Set to true to completely skip JS-based motion while keeping core UX.
const DISABLE_SITE_ANIMATIONS = true;

// DOM elements
const quantityDisplay = document.getElementById('quantity');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeImageGallery();
    initializeScrollAnimations();
    updateCartDisplay();
});

// Event listeners
function initializeEventListeners() {
    // Quantity controls (only attach if present)
    const incBtn = document.getElementById('increase-qty');
    const decBtn = document.getElementById('decrease-qty');
    if (incBtn && quantityDisplay) {
        incBtn.addEventListener('click', () => {
            quantity++;
            quantityDisplay.textContent = quantity;
        });
    }

    if (decBtn && quantityDisplay) {
        decBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
            }
        });
    }

    // Featured product Buy Now (if present)
    const buyNowMain = document.getElementById('buy-now');
    if (buyNowMain) {
        buyNowMain.addEventListener('click', (e) => {
            e.preventDefault();
            buyNowMainProduct(buyNowMain);
        });
    }

    // Cart modal controls (guarded — header cart was removed)
    const cartBtnEl = document.querySelector('.cart-btn');
    if (cartBtnEl) {
        cartBtnEl.addEventListener('click', openCartModal);
    }

    const closeModalEl = document.querySelector('.close-modal');
    if (closeModalEl) {
        closeModalEl.addEventListener('click', closeCartModal);
    }

    const clearCartEl = document.getElementById('clear-cart');
    if (clearCartEl) {
        clearCartEl.addEventListener('click', clearCart);
    }

    const checkoutEl = document.getElementById('checkout');
    if (checkoutEl) {
        checkoutEl.addEventListener('click', checkout);
    }

    // Product card Buy Now buttons
    document.querySelectorAll('.buy-now-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const b = e.currentTarget;
            buyNowProductCard(b);
        });
    });

    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

    // CTA button scroll to the Buy Now / featured product area
    const shopNowBtn = document.getElementById('shop-now-cta') || document.querySelector('.cta-btn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const buyNowBtn = document.getElementById('buy-now');
            if (buyNowBtn) {
                buyNowBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // briefly highlight the buy button to guide the user
                buyNowBtn.classList.add('focus-pulse');
                setTimeout(() => buyNowBtn.classList.remove('focus-pulse'), 1400);
                return;
            }
            // fallback: scroll to featured product section
            const featured = document.querySelector('.featured-product') || document.getElementById('products');
            if (featured) featured.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
}

// Image gallery functionality
function initializeImageGallery() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            // Update main image
            mainImage.src = thumbnail.src.replace('w=150', 'w=600');
        });
    });
}

// Add main product to cart
function addMainProductToCart() {
    const weight = document.getElementById('weight-select').value;
    const type = document.getElementById('type-select').value;
    const price = 369; // Base price

    const product = {
        id: `main-${weight}-${type}`,
        name: 'GUD THEKUA (Chhath Puja)',
        description: `${weight}, ${type}`,
        price: price,
        quantity: quantity,
        image: document.getElementById('main-product-image').src
    };

    addToCart(product);
    showAddToCartAnimation();
}

// Add product card to cart
function addProductToCart(productCard) {
    const name = productCard.querySelector('h3').textContent;
    const priceText = productCard.querySelector('.sale-price').textContent;
    const price = parseInt(priceText.replace('₹', '').replace(',', ''));
    const image = productCard.querySelector('img').src;

    const product = {
        id: `product-${Date.now()}`,
        name: name,
        description: 'Standard pack',
        price: price,
        quantity: 1,
        image: image
    };

    addToCart(product);
    showAddToCartAnimation();
}

// Buy Now for featured product
function buyNowMainProduct(buttonEl) {
    const name = buttonEl.getAttribute('data-name') || 'GUD THEKUA (Chhath Puja)';
    // Read selected options if present
    const weightEl = document.getElementById('weight-select');
    const typeEl = document.getElementById('type-select');
    const weight = weightEl ? weightEl.value : '';
    const type = typeEl ? typeEl.value : '';

    // Determine price from displayed sale-price or data-baseprice
    let price = parseInt(buttonEl.getAttribute('data-baseprice') || '369');
    const saleText = document.querySelector('.product-info .sale-price');
    if (saleText) {
        const p = parseInt(saleText.textContent.replace(/[^0-9]/g, ''));
        if (!isNaN(p)) price = p;
    }

    const product = {
        id: `buynow-main-${Date.now()}`,
        name: name,
        description: `${weight ? weight + ', ' : ''}${type ? type : ''}`.trim(),
        price: price,
        quantity: 1,
        image: document.getElementById('main-product-image').src
    };

    const orderDetails = {
        items: [`${product.name} ${product.description ? '(' + product.description + ')' : ''} × ${product.quantity} = ₹${product.price * product.quantity}`],
        total: product.price * product.quantity,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('mithilacrunch_order', JSON.stringify(orderDetails));
    showCheckoutNotification();
    setTimeout(() => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSdWtt0rKx95CMnhaNLx6wynrf9DYSjm68EyYQk34u4apL-VGQ/viewform?usp=header', '_blank');
    }, 900);
}

// Buy Now for product cards
function buyNowProductCard(buttonEl) {
    const name = buttonEl.getAttribute('data-name') || buttonEl.closest('.product-card').querySelector('h3').textContent;
    let price = parseInt(buttonEl.getAttribute('data-price') || '0');
    if (!price) {
        const priceText = buttonEl.closest('.product-card').querySelector('.sale-price').textContent;
        price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    }
    const image = buttonEl.closest('.product-card').querySelector('img').src;

    const product = {
        id: `buynow-${Date.now()}`,
        name: name,
        description: 'Standard pack',
        price: price,
        quantity: 1,
        image: image
    };

    const orderDetails = {
        items: [`${product.name} × ${product.quantity} = ₹${product.price * product.quantity}`],
        total: product.price * product.quantity,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('mithilacrunch_order', JSON.stringify(orderDetails));
    showCheckoutNotification();
    setTimeout(() => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSdWtt0rKx95CMnhaNLx6wynrf9DYSjm68EyYQk34u4apL-VGQ/viewform?usp=header', '_blank');
    }, 900);
}

// Add to cart function
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    updateCartDisplay();
    saveCartToStorage();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToStorage();
}

// Update cart display
function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart modal content
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p>₹${item.price} × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity('${item.id}', -1)" class="quantity-btn">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.id}', 1)" class="quantity-btn">+</button>
                <button onclick="removeFromCart('${item.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 10px;">Remove</button>
            </div>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toLocaleString();
}

// Update quantity in cart
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// Cart modal functions
function openCartModal() {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Store order details in localStorage for the form
    const orderDetails = {
        items: cart.map(item => `${item.name} × ${item.quantity} = ₹${item.price * item.quantity}`),
        total: total,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('mithilacrunch_order', JSON.stringify(orderDetails));
    
    // Show confirmation message
    const orderSummary = `Order Summary:\n${orderDetails.items.join('\n')}\n\nTotal: ₹${total.toLocaleString()}\n\nYou will now be redirected to complete your order details in our form.`;
    
    if (confirm(orderSummary + '\n\nProceed to order form?')) {
        // Clear cart and close modal
        clearCart();
        closeCartModal();
        
        // Show success notification
        showCheckoutNotification();
        
        // Redirect to Google Form after a short delay
        setTimeout(() => {
            window.open('https://docs.google.com/forms/d/e/1FAIpQLSdWtt0rKx95CMnhaNLx6wynrf9DYSjm68EyYQk34u4apL-VGQ/viewform?usp=header', '_blank');
        }, 1000);
    }
}

// Add to cart animation
function showAddToCartAnimation() {
    // Create a temporary element for animation
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #228B22, #32CD32);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transform: translateX(300px);
        transition: all 0.3s ease;
    `;
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Added to cart!';
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Checkout notification
function showCheckoutNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #8B4513, #D2691E);
        color: white;
        padding: 2rem 3rem;
        border-radius: 15px;
        z-index: 3000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        text-align: center;
        font-size: 1.1rem;
        max-width: 400px;
    `;
    notification.innerHTML = `
        <i class="fas fa-shopping-bag" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        <strong>Order Confirmed!</strong><br>
        <p style="margin: 1rem 0;">Redirecting to order form...</p>
        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; margin-top: 1rem;">
            <div style="width: 0%; height: 100%; background: white; border-radius: 2px; animation: progress 1s ease-in-out forwards;"></div>
        </div>
    `;
    
    // Add progress animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            to { width: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
        document.body.removeChild(notification);
        document.head.removeChild(style);
    }, 1500);
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('mithilacrunch_cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('mithilacrunch_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Scroll animations
function initializeScrollAnimations() {
    // If site animations are disabled, we skip the parallax/tilt/raf/stagger
    // behavior but still reveal content and initialize the mobile menu so
    // core UX features remain functional.
    const selectorList = '.product-card, .review-card, .about-content, .hero-content, .hero-image, .featured-product, .products-section, .about-section, .footer';
    const animateElements = document.querySelectorAll(selectorList);

    if (typeof DISABLE_SITE_ANIMATIONS !== 'undefined' && DISABLE_SITE_ANIMATIONS) {
        // Make everything visible (no stagger/transition) so content is immediately present
        animateElements.forEach(el => el.classList.add('visible'));

        // Ensure thumbnails / main images are shown without animation (gallery already handles src swapping)
        document.querySelectorAll('img').forEach(i => i.style.willChange = 'auto');

        // Initialize minimal mobile menu behavior (copied from below) so menu still works
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        function openMobileMenu() {
            if (!mobileMenu) return;
            mobileMenu.classList.add('open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileMenu() {
            if (!mobileMenu) return;
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', (e) => {
                const isOpen = mobileMenu.classList.contains('open');
                if (isOpen) closeMobileMenu(); else openMobileMenu();
            });
        }
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }
        document.querySelectorAll('.mobile-menu .mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        });

        // Skip the rest of animation setup
        return;
    }

    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        // add base animate class if not present
        if (!element.classList.contains('section-animate')) element.classList.add('section-animate');
        observer.observe(element);
    });

    // Hero parallax (mouse move)
    const hero = document.querySelector('.hero');
    const heroImg = document.querySelector('.hero-image img');
    if (hero && heroImg) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            // subtle translation
            heroImg.style.transform = `translate(${x * 14}px, ${y * 10}px) scale(1.02)`;
        });
        hero.addEventListener('mouseleave', () => {
            heroImg.style.transform = 'translate(0, 0) scale(1)';
        });
    }

    // Product card tilt on mouse move
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotY = x * 6; // degrees
            const rotX = -y * 6;
            card.style.transform = `perspective(700px) translateY(-5px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // CTA button subtle pulse (toggle class)
    const cta = document.querySelector('.cta-btn');
    if (cta) {
        cta.classList.add('btn-pulse');
        setInterval(() => {
            cta.classList.toggle('pulse-active');
        }, 2600);
    }

    /*
     * Smooth scroll-lag parallax system
     * Elements that should parallax: give them attribute `data-parallax` and `data-speed` (e.g. 0.12)
     * We'll lerp the scroll position to create a smooth, Samsung-like motion.
     */
    (function initializeParallax() {
        const layers = Array.from(document.querySelectorAll('[data-parallax]'));
        if (layers.length === 0) return;

        let targetY = window.scrollY;
        let currentY = window.scrollY;
        const ease = 0.09; // smaller = smoother/laggier

        function onScroll() {
            targetY = window.scrollY;
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        function rafLoop() {
            currentY += (targetY - currentY) * ease;

            layers.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.08;
                // Move opposite to scroll for parallax depth (multiply by -1 to get upward movement)
                const y = (currentY * speed) * -1;
                // small X shift for subtle perspective if data-x present
                const xSpeed = parseFloat(el.getAttribute('data-x')) || 0;
                const x = (currentY * xSpeed) * -1;
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });

            requestAnimationFrame(rafLoop);
        }

        requestAnimationFrame(rafLoop);
    })();

    /* Staggered reveal helper: add incremental delay to elements with .stagger when they become visible */
    (function staggerOnVisible() {
        const staggerEls = document.querySelectorAll('.stagger');
        if (!staggerEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // compute a delay based on position among siblings
                    const parent = entry.target.parentElement || document;
                    const siblings = Array.from(parent.querySelectorAll('.stagger'));
                    const index = siblings.indexOf(entry.target);
                    const delay = Math.min(0.12 * index, 0.6);
                    entry.target.style.transitionDelay = `${delay}s`;
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        staggerEls.forEach(el => observer.observe(el));
    })();

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
    }
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            const isOpen = mobileMenu.classList.contains('open');
            if (isOpen) closeMobileMenu(); else openMobileMenu();
        });
    }
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-menu .mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

// Price calculation based on weight and type
function updatePrice() {
    const weight = document.getElementById('weight-select').value;
    const type = document.getElementById('type-select').value;
    
    let basePrice = 369;
    let multiplier = 1;
    
    if (weight === '800g') {
        multiplier = 1.8; // Slightly less than double for bulk pricing
    }
    
    if (type === 'soft') {
        basePrice = 379; // Slightly higher for soft variety
    }
    
    const finalPrice = Math.round(basePrice * multiplier);
    const regularPrice = Math.round(450 * multiplier);
    
    document.querySelector('.sale-price').textContent = `₹${finalPrice.toLocaleString()}`;
    document.querySelector('.regular-price').textContent = `₹${regularPrice.toLocaleString()}`;
}

// Add event listeners for price updates
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('weight-select').addEventListener('change', updatePrice);
    document.getElementById('type-select').addEventListener('change', updatePrice);
    
    // Load cart from storage
    loadCartFromStorage();
});

// Utility functions
function formatCurrency(amount) {
    return `₹${amount.toLocaleString()}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality (for future enhancement)
function searchProducts(query) {
    // This would integrate with a backend search system
    console.log('Searching for:', query);
}

// Newsletter subscription (for future enhancement)
function subscribeNewsletter(email) {
    // This would integrate with an email service
    console.log('Newsletter subscription:', email);
    alert('Thank you for subscribing to our newsletter!');
}

// Social media sharing
function shareProduct(platform) {
    const productName = 'GUD THEKUA (Chhath Puja) | Aata & Jaggery';
    const productUrl = window.location.href;
    const productImage = document.getElementById('main-product-image').src;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(productName + ' ' + productUrl)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Get order summary for form
function getOrderSummary() {
    const orderDetails = localStorage.getItem('mithilacrunch_order');
    if (orderDetails) {
        const order = JSON.parse(orderDetails);
        return `Order Items:\n${order.items.join('\n')}\n\nTotal Amount: ₹${order.total.toLocaleString()}\n\nOrder Time: ${new Date(order.timestamp).toLocaleString()}`;
    }
    return '';
}

// Copy order details to clipboard (helper function)
function copyOrderToClipboard() {
    const orderSummary = getOrderSummary();
    if (orderSummary) {
        navigator.clipboard.writeText(orderSummary).then(() => {
            alert('Order details copied to clipboard! You can paste this in the form.');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = orderSummary;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Order details copied to clipboard! You can paste this in the form.');
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mithila Crunch website loaded successfully!');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Check if there are order details and show copy button
    if (localStorage.getItem('mithilacrunch_order')) {
        console.log('Order details available for form');
    }
});