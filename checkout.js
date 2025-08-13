// Import Firebase modules for authentication and database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVTV34a0jw5ScKywj-YXy5bt9FG01JBn0",
  authDomain: "wood12-f40fe.firebaseapp.com",
  projectId: "wood12-f40fe",
  storageBucket: "wood12-f40fe.firebasestorage.app",
  messagingSenderId: "522201725736",
  appId: "1:522201725736:web:78d597f9d5da25c1dbee1d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let cart = [];
let currentUser = null;
let selectedDeliveryOption = 'standard';
let selectedPaymentMethod = 'card';
let deliveryCosts = {
  standard: 0,
  express: 49.99,
  'white-glove': 149.99
};

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateUserDisplay(user);
  if (user) {
    // Pre-fill user information if available
    prefillUserInfo(user);
    // Load cart from Firestore for authenticated users
    await loadCartFromFirestore();
  } else {
    // Load cart from localStorage for non-authenticated users
    loadCart();
  }
});

// Update user display in navigation
function updateUserDisplay(user) {
  const authNavItem = document.getElementById('auth-nav-item');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  
  if (user) {
    if (authNavItem) authNavItem.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
    if (userAvatar) {
      userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff&size=40`;
    }
  } else {
    if (authNavItem) authNavItem.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
  }
}

// Pre-fill user information from Firebase auth
function prefillUserInfo(user) {
  const emailInput = document.getElementById('email');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  
  if (emailInput && user.email) {
    emailInput.value = user.email;
  }
  
  if (user.displayName) {
    const nameParts = user.displayName.split(' ');
    if (firstNameInput && nameParts[0]) {
      firstNameInput.value = nameParts[0];
    }
    if (lastNameInput && nameParts.length > 1) {
      lastNameInput.value = nameParts.slice(1).join(' ');
    }
  }
}

// Load cart from localStorage
function loadCart() {
  // Check if this is a café checkout
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutType = urlParams.get('type');
  
  if (checkoutType === 'cafe') {
    // Load café cart items
    const savedCafeCart = localStorage.getItem('cafeCart');
    if (savedCafeCart) {
      cart = JSON.parse(savedCafeCart);
      console.log('Loaded café cart for checkout:', cart);
    }
  } else {
    // Load regular cart items
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  }
  
  updateOrderSummary();
  updateCartCount();
}

// Load cart from Firestore (for authenticated users)
async function loadCartFromFirestore() {
  if (!currentUser) {
    // If no user, fall back to localStorage
    loadCart();
    return;
  }
  
  // Check if this is a café checkout
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutType = urlParams.get('type');
  
  if (checkoutType === 'cafe') {
    // For café checkout, always load from localStorage since café cart is separate
    loadCart();
    return;
  }
  
  try {
    const userCartRef = doc(db, 'carts', currentUser.uid);
    const cartSnap = await getDoc(userCartRef);
    
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      cart = cartData.items || [];
      console.log('Cart loaded from Firestore on checkout page:', cart);
    } else {
      // No cart in Firestore, try localStorage
      loadCart();
      console.log('No cart in Firestore, loaded from localStorage');
    }
    
    updateOrderSummary();
    updateCartCount();
  } catch (error) {
    console.error('Error loading cart from Firestore:', error);
    // Fallback to localStorage
    loadCart();
  }
}

// Update cart count in navigation
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Update order summary
function updateOrderSummary() {
  const orderItemsContainer = document.getElementById('order-items');
  const subtotalElement = document.getElementById('subtotal');
  const deliveryCostElement = document.getElementById('delivery-cost');
  const taxElement = document.getElementById('tax');
  const finalTotalElement = document.getElementById('final-total');
  
  if (!orderItemsContainer) return;
  
  // Clear existing items
  orderItemsContainer.innerHTML = '';
  
  let subtotal = 0;
  
  // Add each cart item
  cart.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="item-image">
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-price">$${item.price} × ${item.quantity}</div>
      </div>
    `;
    orderItemsContainer.appendChild(orderItem);
    subtotal += item.price * item.quantity;
  });
  
  // Calculate costs
  const deliveryCost = deliveryCosts[selectedDeliveryOption];
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + deliveryCost + tax;
  
  // Update display
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (deliveryCostElement) {
    deliveryCostElement.textContent = deliveryCost === 0 ? 'FREE' : `$${deliveryCost.toFixed(2)}`;
  }
  if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
  if (finalTotalElement) finalTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Select delivery option
function selectDeliveryOption(option) {
  selectedDeliveryOption = option;
  
  // Update UI
  document.querySelectorAll('.delivery-option').forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Update the radio button
  const radioButton = event.currentTarget.querySelector('input[type="radio"]');
  if (radioButton) {
    radioButton.checked = true;
  }
  
  // Update order summary
  updateOrderSummary();
}

// Select payment method
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  
  // Update UI
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Update the radio button
  const radioButton = event.currentTarget.querySelector('input[type="radio"]');
  if (radioButton) {
    radioButton.checked = true;
  }
  
  // Show/hide card details
  const cardDetails = document.getElementById('card-details');
  if (cardDetails) {
    cardDetails.style.display = method === 'card' ? 'block' : 'none';
  }
}

// Format card number input
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formattedValue;
}

// Format expiry date input
function formatExpiryDate(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  input.value = value;
}

// Validate form
function validateForm() {
  const form = document.getElementById('checkout-form');
  const requiredFields = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      field.style.borderColor = '#d1d5db';
    }
  });
  
  // Validate email format
  const emailField = document.getElementById('email');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      emailField.style.borderColor = '#ef4444';
      isValid = false;
    }
  }
  
  // Validate card details if card payment is selected
  if (selectedPaymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    const cardName = document.getElementById('cardName');
    
    if (!cardNumber.value || cardNumber.value.replace(/\s/g, '').length < 13) {
      cardNumber.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!expiryDate.value || expiryDate.value.length < 5) {
      expiryDate.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!cvv.value || cvv.value.length < 3) {
      cvv.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!cardName.value.trim()) {
      cardName.style.borderColor = '#ef4444';
      isValid = false;
    }
  }
  
  return isValid;
}

// Place order
async function placeOrder() {
  if (!validateForm()) {
    showNotification('Please fill in all required fields correctly.', 'error');
    return;
  }
  
  if (cart.length === 0) {
    showNotification('Your cart is empty. Please add items before checkout.', 'error');
    return;
  }
  
  const placeOrderBtn = document.querySelector('.place-order-btn');
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = '🔄 Processing Order...';
  
  try {
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get form data
    const formData = new FormData(document.getElementById('checkout-form'));
    const orderId = generateOrderId();
    const orderData = {
      user: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName
      } : null,
      userId: currentUser ? currentUser.uid : null,
      items: cart,
      deliveryInfo: Object.fromEntries(formData),
      deliveryOption: selectedDeliveryOption,
      paymentMethod: selectedPaymentMethod,
      total: calculateTotal(),
      orderDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: getEstimatedDelivery(),
      deliveryAddress: getDeliveryAddress(Object.fromEntries(formData)),
      orderId: orderId,
      status: 'pending',
      currentStatus: 'processing',
      timeline: createInitialTimeline(),
      createdAt: serverTimestamp()
    };
    
    // Save order to Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, orderData);
      console.log('Order saved to Firestore:', orderId);
      
      // If user is authenticated, also save to user's order history
      if (currentUser) {
        const userOrderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
        await setDoc(userOrderRef, {
          orderId: orderId,
          total: orderData.total,
          status: 'pending',
          orderDate: serverTimestamp(),
          itemCount: cart.length
        });
        
        // Clear user's cart from Firestore
        const userCartRef = doc(db, 'carts', currentUser.uid);
        await deleteDoc(userCartRef);
      }
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      // Fallback to localStorage if Firestore fails
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    cart = [];
    
    // Show success message and redirect
    showNotification('🎉 Order placed successfully! You will receive a confirmation email shortly.', 'success');
    
    // Redirect to order confirmation page after a delay
    setTimeout(() => {
      window.location.href = `order-confirmation.html?orderId=${orderData.orderId}`;
    }, 2000);
    
  } catch (error) {
    console.error('Order placement error:', error);
    showNotification('There was an error processing your order. Please try again.', 'error');
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = '🛒 Place Order';
  }
}

// Calculate total
function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = deliveryCosts[selectedDeliveryOption];
  const tax = subtotal * 0.08;
  return subtotal + deliveryCost + tax;
}

// Generate order ID
function generateOrderId() {
  return 'WW' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Sign out function
async function signOutUser() {
  try {
    await signOut(auth);
    showNotification('Successfully signed out!', 'success');
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Error signing out. Please try again.', 'error');
  }
}

// Toggle cart (redirect back to main page)
function toggleCart() {
  window.location.href = 'index.html';
}

// Open auth modal (redirect to main page)
function openAuthModal() {
  window.location.href = 'index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if this is a café checkout and update page title
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutType = urlParams.get('type');
  
  if (checkoutType === 'cafe') {
    // Update page title and header for café checkout
    document.title = 'Café Checkout - Wood & Whimsy';
    const checkoutHeader = document.querySelector('.checkout-header h1');
    if (checkoutHeader) {
      checkoutHeader.textContent = '☕ Café Checkout';
    }
    const checkoutDescription = document.querySelector('.checkout-header p');
    if (checkoutDescription) {
      checkoutDescription.textContent = 'Complete your café order and we\'ll have your delicious items ready for pickup or delivery!';
    }
  }
  
  loadCart();
  
  // Add event listeners for form inputs
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => formatCardNumber(e.target));
  }
  
  const expiryDateInput = document.getElementById('expiryDate');
  if (expiryDateInput) {
    expiryDateInput.addEventListener('input', (e) => formatExpiryDate(e.target));
  }
  
  // CVV input - only allow numbers
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
  
  // Make functions globally available
  window.selectDeliveryOption = selectDeliveryOption;
  window.selectPaymentMethod = selectPaymentMethod;
  window.placeOrder = placeOrder;
  window.signOutUser = signOutUser;
  window.toggleCart = toggleCart;
  window.openAuthModal = openAuthModal;
});

// Helper functions for tracking system integration
function getEstimatedDelivery() {
  const today = new Date();
  const deliveryDate = new Date(today);
  
  // Add delivery days based on delivery option
  switch (selectedDeliveryOption) {
    case 'express':
      deliveryDate.setDate(today.getDate() + 3);
      break;
    case 'white-glove':
      deliveryDate.setDate(today.getDate() + 7);
      break;
    default: // standard
      deliveryDate.setDate(today.getDate() + 7);
  }
  
  return deliveryDate.toISOString().split('T')[0];
}

function getDeliveryAddress(formData) {
  return `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
}

function createInitialTimeline() {
  const now = new Date().toISOString();
  const timeline = [
    {
      status: 'processing',
      date: now,
      location: 'Wood & Whimsy Workshop',
      completed: true,
      current: true
    },
    {
      status: 'confirmed',
      date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
      location: 'Wood & Whimsy Workshop',
      completed: false
    },
    {
      status: 'manufacturing',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 day
      location: 'Wood & Whimsy Workshop',
      completed: false
    },
    {
      status: 'quality_check',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 days
      location: 'Wood & Whimsy Workshop',
      completed: false
    },
    {
      status: 'shipped',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 days
      location: 'Distribution Center',
      completed: false
    },
    {
      status: 'out_for_delivery',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
      location: 'Local Delivery Hub',
      completed: false
    },
    {
      status: 'delivered',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // +7 days +8 hours
      location: 'Customer Address',
      completed: false
    }
  ];
  
  return timeline;
}
