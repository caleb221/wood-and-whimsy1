// Advanced Search and Filter Functionality for Wood & Whimsy
class ProductSearch {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.searchTerm = '';
    this.filters = {
      category: '',
      priceRange: '',
      sortBy: 'featured'
    };
    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.displayProducts();
  }

  loadProducts() {
    // Convert products object to array for easier manipulation
    this.allProducts = Object.values(products);
    this.filteredProducts = [...this.allProducts];
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');

    // Search input with debouncing
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchTerm = e.target.value.toLowerCase();
        this.applyFilters();
        this.showSearchSuggestions(e.target.value);
      }, 300);
    });

    // Real-time filtering
    categoryFilter?.addEventListener('change', () => this.applyFilters());
    priceFilter?.addEventListener('change', () => this.applyFilters());
    sortFilter?.addEventListener('change', () => this.applyFilters());

    // Clear search when clicking outside suggestions
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSearchSuggestions();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm) ||
        product.category.toLowerCase().includes(this.searchTerm) ||
        product.subcategory.toLowerCase().includes(this.searchTerm) ||
        product.description.toLowerCase().includes(this.searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
      );
    }

    // Apply category filter
    const categoryFilter = document.getElementById('category-filter')?.value;
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply price filter
    const priceFilter = document.getElementById('price-filter')?.value;
    if (priceFilter) {
      const [min, max] = this.parsePriceRange(priceFilter);
      filtered = filtered.filter(product => {
        const price = product.price;
        if (max === Infinity) return price >= min;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    const sortFilter = document.getElementById('sort-filter')?.value;
    filtered = this.sortProducts(filtered, sortFilter);

    this.filteredProducts = filtered;
    this.displayProducts();
    this.updateResultsCount();
  }

  parsePriceRange(range) {
    if (range === '1000+') return [1000, Infinity];
    const [min, max] = range.split('-').map(Number);
    return [min, max || Infinity];
  }

  sortProducts(products, sortBy) {
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'rating':
        return products.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return products.sort((a, b) => b.id - a.id);
      case 'featured':
      default:
        return products.sort((a, b) => {
          // Prioritize products with bestseller tag
          const aFeatured = a.tags.includes('bestseller') ? 1 : 0;
          const bFeatured = b.tags.includes('bestseller') ? 1 : 0;
          return bFeatured - aFeatured;
        });
    }
  }

  displayProducts() {
    const productsGrid = document.getElementById('shop-products-grid');
    if (!productsGrid) return;

    if (this.filteredProducts.length === 0) {
      productsGrid.innerHTML = this.getNoResultsHTML();
      return;
    }

    productsGrid.innerHTML = this.filteredProducts.map(product => 
      this.createProductCard(product)
    ).join('');
  }

  createProductCard(product) {
    const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    
    return `
      <div class="product-card" data-id="${product.id}" data-category="${product.category.toLowerCase().replace(' ', '-')}" data-price="${product.price}">
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
          ${product.tags.includes('bestseller') ? '<div class="product-badge featured">Best Seller</div>' : ''}
          ${product.discount > 0 ? `<div class="product-badge sale">${discountPercentage}% OFF</div>` : ''}
          <button class="favorite-btn" onclick="toggleFavorite(${product.id})">♡</button>
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            ${this.generateStarRating(product.rating)}
            <span class="rating-count">(${product.reviewCount})</span>
          </div>
          <div class="product-pricing">
            <span class="current-price">$${product.price}</span>
            ${product.originalPrice > product.price ? 
              `<span class="original-price">$${product.originalPrice}</span>` : ''}
          </div>
          <div class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? `✓ ${product.stockCount} in stock` : '✗ Out of stock'}
          </div>
          <div class="product-actions">
            <button class="view-details-btn" onclick="viewProductDetail(${product.id})">
              Details
            </button>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
              + Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }

  generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span class="star filled">★</span>';
      } else if (i - 0.5 <= rating) {
        stars += '<span class="star half">★</span>';
      } else {
        stars += '<span class="star empty">☆</span>';
      }
    }
    return `<div class="stars">${stars}</div>`;
  }

  getNoResultsHTML() {
    return `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search terms or filters</p>
        <button class="clear-filters-btn" onclick="productSearch.clearAllFilters()">
          Clear All Filters
        </button>
      </div>
    `;
  }

  showSearchSuggestions(query) {
    if (!query || query.length < 2) {
      this.hideSearchSuggestions();
      return;
    }

    const suggestions = this.generateSuggestions(query.toLowerCase());
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (suggestions.length === 0) {
      this.hideSearchSuggestions();
      return;
    }

    suggestionsContainer.innerHTML = suggestions.map(suggestion => 
      `<div class="suggestion-item" onclick="productSearch.selectSuggestion('${suggestion}')">
        ${suggestion}
      </div>`
    ).join('');
    
    suggestionsContainer.style.display = 'block';
  }

  generateSuggestions(query) {
    const suggestions = new Set();
    
    this.allProducts.forEach(product => {
      // Product names
      if (product.name.toLowerCase().includes(query)) {
        suggestions.add(product.name);
      }
      
      // Categories
      if (product.category.toLowerCase().includes(query)) {
        suggestions.add(product.category);
      }
      
      // Tags
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag.charAt(0).toUpperCase() + tag.slice(1));
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  selectSuggestion(suggestion) {
    document.getElementById('search-input').value = suggestion;
    this.searchTerm = suggestion.toLowerCase();
    this.applyFilters();
    this.hideSearchSuggestions();
  }

  hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  }

  updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      const count = this.filteredProducts.length;
      const total = this.allProducts.length;
      
      if (this.searchTerm || this.hasActiveFilters()) {
        resultsCount.textContent = `Showing ${count} of ${total} products`;
      } else {
        resultsCount.textContent = `Showing all ${total} products`;
      }
    }
  }

  hasActiveFilters() {
    const categoryFilter = document.getElementById('category-filter')?.value;
    const priceFilter = document.getElementById('price-filter')?.value;
    const sortFilter = document.getElementById('sort-filter')?.value;
    
    return categoryFilter || priceFilter || (sortFilter && sortFilter !== 'featured');
  }

  clearAllFilters() {
    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset filters
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) categoryFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    if (sortFilter) sortFilter.value = 'featured';
    
    // Reset internal state
    this.searchTerm = '';
    this.filteredProducts = [...this.allProducts];
    
    // Refresh display
    this.displayProducts();
    this.updateResultsCount();
    this.hideSearchSuggestions();
  }

  // Public method for external calls
  performSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      this.searchTerm = searchInput.value.toLowerCase();
      this.applyFilters();
    }
  }
}

// Global functions for onclick handlers
function performSearch() {
  if (window.productSearch) {
    window.productSearch.performSearch();
  }
}

function applyFilters() {
  if (window.productSearch) {
    window.productSearch.applyFilters();
  }
}

function clearFilters() {
  if (window.productSearch) {
    window.productSearch.clearAllFilters();
  }
}

function viewProductDetail(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

function toggleFavorite(productId) {
  // Add to wishlist functionality
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const index = wishlist.indexOf(productId);
  
  if (index > -1) {
    wishlist.splice(index, 1);
    showNotification('Removed from wishlist', 'info');
  } else {
    wishlist.push(productId);
    showNotification('Added to wishlist!', 'success');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  document.querySelectorAll('.favorite-btn').forEach((btn, index) => {
    const productId = parseInt(btn.closest('.product-card').dataset.id);
    btn.textContent = wishlist.includes(productId) ? '♥' : '♡';
    btn.style.color = wishlist.includes(productId) ? '#ef4444' : '#6b7280';
  });
}

// Add to Cart functionality
function addToCart(productId, quantity = 1) {
  const product = products[productId];
  if (!product) {
    showNotification('Product not found', 'error');
    return;
  }

  // Get existing cart or initialize
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if product already in cart
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Show notification
  showNotification(`${product.name} added to cart!`, 'success');
}

// Update cart count display
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  
  if (cartSidebar) {
    const isOpen = cartSidebar.classList.contains('open');
    
    if (isOpen) {
      // Close cart
      cartSidebar.classList.remove('open');
      if (cartOverlay) cartOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    } else {
      // Open cart
      cartSidebar.classList.add('open');
      if (cartOverlay) cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderCart();
    }
  }
}

// Render cart items
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    if (cartTotal) cartTotal.textContent = '0.00';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-quantity">
          <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button onclick="removeFromCart(${item.id})" class="remove-item">×</button>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== productId);
    }
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== productId);
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
  
  const product = products[productId];
  if (product) {
    showNotification(`${product.name} removed from cart`, 'info');
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (typeof products !== 'undefined') {
    window.productSearch = new ProductSearch();
    updateWishlistUI();
    updateCartCount();
  }
});
