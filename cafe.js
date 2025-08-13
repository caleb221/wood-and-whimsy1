// Initialize café cart
window.cafeCart = JSON.parse(localStorage.getItem('cafeCart') || '[]');

// Add item to café order
window.addToOrder = function(itemName, price, buttonElement) {
  console.log('Adding to café order:', itemName, price);
  
  // Find the menu item to get its image
  let itemImage = 'placeholder.jpg';
  
  if (buttonElement) {
    const menuItem = buttonElement.closest('.menu-item');
    if (menuItem) {
      const img = menuItem.querySelector('.menu-item-image img');
      if (img && img.src) {
        itemImage = img.src;
      }
    }
  }
  
  const cafeItem = {
    id: `cafe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: itemName,
    price: parseFloat(price),
    quantity: 1,
    category: 'cafe',
    type: 'cafe-item',
    image: itemImage
  };
  
  // Check if item already exists in café cart
  const existingItem = window.cafeCart.find(item => item.name === itemName);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    window.cafeCart.push(cafeItem);
  }
  
  // Save to localStorage
  localStorage.setItem('cafeCart', JSON.stringify(window.cafeCart));
  
  // Update display
  updateCafeCartCount();
  renderCafeCart();
  
  // Show notification
  showCafeNotification(`✅ ${itemName} added to café order!`, 'success');
  
  // Button feedback
  if (buttonElement) {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = '✅ Added!';
    buttonElement.style.background = '#10b981';
    buttonElement.style.color = 'white';
    
    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.style.background = '';
      buttonElement.style.color = '';
    }, 1500);
  }
};

// Show café notification function
function showCafeNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = 'cafe-notification';
  notification.innerHTML = `<span>${message}</span>`;
  
  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Filter menu category function
window.filterMenuCategory = function(category) {
  console.log('Filtering menu by category:', category);
  
  // Update active button
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(btn => {
    btn.classList.remove('active');
    if ((category === 'all' && btn.textContent === 'All Items') ||
        (category === 'coffee' && btn.textContent === 'Coffee & Beverages') ||
        (category === 'pastries' && btn.textContent === 'Pastries & Snacks') ||
        (category === 'meals' && btn.textContent === 'Light Meals') ||
        (category === 'ghanaian' && btn.textContent === 'Ghanaian Cuisine')) {
      btn.classList.add('active');
    }
  });
  
  // Filter menu items
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    const itemCategory = item.getAttribute('data-category');
    if (category === 'all' || itemCategory === category) {
      item.style.display = 'block';
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'all 0.3s ease';
      }, 100);
    } else {
      item.style.display = 'none';
    }
  });
};

// Update café cart count
function updateCafeCartCount() {
  if (!window.cafeCart) {
    window.cafeCart = [];
  }
  
  const totalItems = window.cafeCart.reduce((sum, item) => sum + item.quantity, 0);
  const cafeCartCount = document.getElementById('cafe-cart-count');
  
  if (cafeCartCount) {
    cafeCartCount.textContent = totalItems;
  }
}

// Toggle café cart sidebar
window.toggleCafeCart = function() {
  const cafeCartSidebar = document.getElementById('cafe-cart-sidebar');
  if (cafeCartSidebar) {
    cafeCartSidebar.classList.toggle('open');
    if (cafeCartSidebar.classList.contains('open')) {
      renderCafeCart();
    }
  }
};

// Render café cart items
function renderCafeCart() {
  const cafeCartItemsContainer = document.getElementById('cafe-cart-items');
  const cafeCartTotal = document.getElementById('cafe-cart-total');
  
  if (!cafeCartItemsContainer || !cafeCartTotal) return;
  
  if (window.cafeCart.length === 0) {
    cafeCartItemsContainer.innerHTML = '<div class="empty-cart"><p>Your café order is empty</p><p>☕<br>Add some delicious items!</p></div>';
    cafeCartTotal.textContent = '0.00';
    return;
  }
  
  let total = 0;
  cafeCartItemsContainer.innerHTML = window.cafeCart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" onerror="this.src='placeholder.jpg'">
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button onclick="updateCafeCartQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCafeCartQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="remove-item-btn" onclick="removeFromCafeCart('${item.id}')">×</button>
      </div>
    `;
  }).join('');
  
  cafeCartTotal.textContent = total.toFixed(2);
}

// Update café cart item quantity
window.updateCafeCartQuantity = function(itemId, change) {
  const item = window.cafeCart.find(item => item.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCafeCart(itemId);
    } else {
      localStorage.setItem('cafeCart', JSON.stringify(window.cafeCart));
      updateCafeCartCount();
      renderCafeCart();
    }
  }
};

// Remove item from café cart
window.removeFromCafeCart = function(itemId) {
  window.cafeCart = window.cafeCart.filter(item => item.id !== itemId);
  localStorage.setItem('cafeCart', JSON.stringify(window.cafeCart));
  updateCafeCartCount();
  renderCafeCart();
};

// Proceed to café checkout
window.proceedToCafeCheckout = function() {
  if (window.cafeCart.length === 0) {
    showCafeNotification('Your café order is empty!', 'error');
    return;
  }
  
  showCafeNotification('Redirecting to café checkout...', 'success');
  setTimeout(() => {
    window.location.href = 'checkout.html?type=cafe';
  }, 1000);
};

// Toggle regular cart (for furniture)
window.toggleCart = function() {
  // This is just a placeholder since we're on the café page
  showCafeNotification('Visit our shop page to browse furniture!', 'info');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCafeCartCount();
  renderCafeCart();
});
