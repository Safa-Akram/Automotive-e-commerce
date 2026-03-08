document.addEventListener('DOMContentLoaded', () => {
    // State
    let products = [];
    let cart = [];
    let activeCategory = 'all';

    // DOM Elements
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');

    const cartToggleBtn = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Fetch Products
    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            products = await res.json();

            renderFilters();
            renderProducts();
        } catch (error) {
            console.error(error);
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--accent-primary);">Failed to load products. Ensure the server is running.</p>';
        }
    };

    // Render Filters
    const renderFilters = () => {
        const categories = ['all', ...new Set(products.map(p => p.category))];

        categoryFilters.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === activeCategory ? 'active' : ''}" data-filter="${cat}">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
        `).join('');

        // Add Event Listeners to New Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                activeCategory = e.target.dataset.filter;
                renderProducts();
            });
        });
    };

    // Render Products
    const renderProducts = () => {
        const filteredProducts = activeCategory === 'all'
            ? products
            : products.filter(p => p.category === activeCategory);

        productGrid.innerHTML = filteredProducts.map(p => `
            <div class="product-card">
                <div class="product-image-container">
                    <span class="product-badge">${p.category}</span>
                    <!-- Using placeholder.co or similar if image fails, but server should serve images once added -->
                    <img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.src='https://placehold.co/400x300/1e2128/94a3b8?text=Image+Not+Found'">
                </div>
                <div class="product-info">
                    <span class="product-brand">${p.brand}</span>
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-desc">${p.description}</p>
                    <div class="product-footer">
                        <span class="product-price">$${p.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to Add to Cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                addToCart(id);
            });
        });
    };

    // Cart Logic
    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            cart.push(product);
            updateCartUI();

            // UI Feedback
            cartToggleBtn.style.transform = 'scale(1.2)';
            setTimeout(() => { cartToggleBtn.style.transform = 'scale(1)'; }, 200);
        }
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    const updateCartUI = () => {
        cartCountEl.textContent = cart.length;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            cartTotalPriceEl.textContent = '$0.00';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            return;
        }

        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://placehold.co/60x60/1e2128/94a3b8?text=NA'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" onclick="window.removeCartItem(${index})">Remove</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
    };

    // Required for the inline onclick handler in innerHTML
    window.removeCartItem = removeFromCart;

    // Cart Sidebar Toggle
    const openCart = () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    };

    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Checkout Simulation
    checkoutBtn.addEventListener('click', async () => {
        try {
            checkoutBtn.textContent = 'Processing...';
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });
            const data = await res.json();

            if (data.url) {
                // For demo, redirect to the mock success page
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed.');
        } finally {
            checkoutBtn.textContent = 'Proceed to Checkout';
        }
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const contactResetBtn = document.getElementById('contact-reset-btn');

    if (contactForm && contactSuccess && contactResetBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, send data to the server here

            // Hide form and show success message
            contactForm.style.display = 'none';
            contactSuccess.style.display = 'flex';
        });

        contactResetBtn.addEventListener('click', () => {
            // Reset form and show it again
            contactForm.reset();
            contactSuccess.style.display = 'none';
            contactForm.style.display = 'block';
        });
    }

    // Initialize
    fetchProducts();
});
