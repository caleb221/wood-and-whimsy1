// Product Detail Page JavaScript
let currentProduct = null;
let currentImageIndex = 0;

// Get product ID from URL
function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
}

// Load and display product
function loadProduct() {
  const productId = getProductId();
  currentProduct = products[productId];
  
  if (!currentProduct) {
    window.location.href = 'shop.html';
    return;
  }

  populateProductData();
}

// Populate all product data
function populateProductData() {
  const product = currentProduct;
  
  // Update page title and breadcrumb
  document.title = `${product.name} - Wood & Whimsy`;
  document.getElementById('breadcrumb-category').textContent = product.category;
  document.getElementById('breadcrumb-product').textContent = product.name;
  
  // Basic info
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description-text').textContent = product.description;
  document.getElementById('current-price').textContent = `$${product.price}`;
  document.getElementById('original-price').textContent = `$${product.originalPrice}`;
  document.getElementById('discount-badge').textContent = `${product.discount}% OFF`;
  document.getElementById('rating-text').textContent = `(${product.rating})`;
  document.getElementById('review-count').textContent = `(${product.reviewCount} reviews)`;
  document.getElementById('stock-count').textContent = `(${product.stockCount} available)`;
  
  // Stock status
  const stockStatus = document.getElementById('stock-status');
  if (product.inStock) {
    stockStatus.className = 'stock-status in-stock';
    stockStatus.innerHTML = '✓ In Stock';
  } else {
    stockStatus.className = 'stock-status out-of-stock';
    stockStatus.innerHTML = '✗ Out of Stock';
  }
  
  populateImages();
  populateFeatures();
  populateSpecifications();
  populateReviews();
  populateRelatedProducts();
  generateStarRating('product-stars', product.rating);
}

// Populate product images
function populateImages() {
  const product = currentProduct;
  const mainImage = document.getElementById('main-product-image');
  const thumbnailGrid = document.getElementById('thumbnail-grid');
  
  if (product.images && product.images.length > 0) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
    
    thumbnailGrid.innerHTML = '';
    product.images.forEach((image, index) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = image;
      thumbnail.alt = `${product.name} - Image ${index + 1}`;
      thumbnail.className = index === 0 ? 'thumbnail active' : 'thumbnail';
      thumbnail.onclick = () => selectImage(index);
      thumbnailGrid.appendChild(thumbnail);
    });
  }
}

// Select image
function selectImage(index) {
  currentImageIndex = index;
  const product = currentProduct;
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  mainImage.src = product.images[index];
  
  thumbnails.forEach((thumb, i) => {
    thumb.className = i === index ? 'thumbnail active' : 'thumbnail';
  });
}

// Populate features
function populateFeatures() {
  const product = currentProduct;
  const featuresList = document.getElementById('product-features-list');
  
  featuresList.innerHTML = '';
  product.features.forEach(feature => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="feature-icon">✓</span> ${feature}`;
    featuresList.appendChild(li);
  });
}

// Populate specifications
function populateSpecifications() {
  const product = currentProduct;
  const specsGrid = document.getElementById('specifications-grid');
  
  specsGrid.innerHTML = '';
  Object.entries(product.specifications).forEach(([key, value]) => {
    const specItem = document.createElement('div');
    specItem.className = 'spec-item';
    specItem.innerHTML = `
      <div class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</div>
      <div class="spec-value">${Array.isArray(value) ? value.join(', ') : value}</div>
    `;
    specsGrid.appendChild(specItem);
  });
}

// Populate reviews
function populateReviews() {
  const product = currentProduct;
  const reviewsList = document.getElementById('reviews-list');
  
  reviewsList.innerHTML = '';
  product.reviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item';
    reviewElement.innerHTML = `
      <div class="review-header">
        <div class="reviewer-info">
          <strong>${review.name}</strong>
          ${review.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
        </div>
        <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
      </div>
      <div class="review-rating">${generateStarHTML(review.rating)}</div>
      <h4 class="review-title">${review.title}</h4>
      <p class="review-comment">${review.comment}</p>
      <div class="review-helpful">
        <button class="helpful-btn">👍 Helpful (${review.helpful})</button>
      </div>
    `;
    reviewsList.appendChild(reviewElement);
  });
}

// Populate related products
function populateRelatedProducts() {
  const product = currentProduct;
  const relatedGrid = document.getElementById('related-products-grid');
  
  relatedGrid.innerHTML = '';
  if (product.relatedProducts) {
    product.relatedProducts.forEach(relatedId => {
      const relatedProduct = products[relatedId];
      if (relatedProduct) {
        const productCard = document.createElement('div');
        productCard.className = 'related-product-card';
        productCard.innerHTML = `
          <div class="related-product-image">
            <img src="${relatedProduct.images[0]}" alt="${relatedProduct.name}">
          </div>
          <div class="related-product-info">
            <h4>${relatedProduct.name}</h4>
            <div class="related-product-rating">
              ${generateStarHTML(relatedProduct.rating)} (${relatedProduct.reviewCount})
            </div>
            <div class="related-product-price">
              <span class="price">$${relatedProduct.price}</span>
            </div>
            <button class="view-product-btn" onclick="viewProduct(${relatedProduct.id})">
              View Details
            </button>
          </div>
        `;
        relatedGrid.appendChild(productCard);
      }
    });
  }
}

// Generate star rating HTML
function generateStarHTML(rating) {
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
  return stars;
}

// Generate star rating in element
function generateStarRating(elementId, rating) {
  const element = document.getElementById(elementId);
  element.innerHTML = generateStarHTML(rating);
}

// Tab functionality
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-panel');
  const buttons = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.classList.add('active');
}

// Quantity controls
function updateQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  let currentQuantity = parseInt(quantityInput.value);
  let newQuantity = currentQuantity + change;
  
  if (newQuantity >= 1 && newQuantity <= currentProduct.stockCount) {
    quantityInput.value = newQuantity;
  }
}

// Add to cart from detail page
function addToCartFromDetail() {
  const quantity = parseInt(document.getElementById('quantity').value);
  
  // Get existing cart or initialize
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if product already in cart
  const existingItem = cart.find(item => item.id === currentProduct.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.images[0],
      quantity: quantity
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  // Show notification
  showNotification(`${currentProduct.name} added to cart!`, 'success');
}

// Buy now functionality
function buyNow() {
  addToCartFromDetail();
  window.location.href = 'checkout.html';
}

// Wishlist functionality
function toggleWishlist() {
  const wishlistBtn = document.querySelector('.wishlist-btn');
  const isWishlisted = wishlistBtn.textContent === '♥';
  
  if (isWishlisted) {
    wishlistBtn.textContent = '♡';
    showNotification('Removed from wishlist', 'info');
  } else {
    wishlistBtn.textContent = '♥';
    showNotification('Added to wishlist!', 'success');
  }
}

// View related product
function viewProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
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

// Placeholder cart toggle function
function toggleCart() {
  // This should integrate with existing cart system
  console.log('Toggle cart');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadProduct();
  updateCartCount();
});
