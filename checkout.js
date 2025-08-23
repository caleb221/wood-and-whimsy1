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
  
  // Show/hide payment details based on method
  const cardDetails = document.getElementById('card-details');
  const mtnDetails = document.getElementById('mtn-details');
  const airteltigoDetails = document.getElementById('airteltigo-details');
  const telecelDetails = document.getElementById('telecel-details');
  
  // Hide all payment detail sections first
  if (cardDetails) cardDetails.style.display = 'none';
  if (mtnDetails) mtnDetails.style.display = 'none';
  if (airteltigoDetails) airteltigoDetails.style.display = 'none';
  if (telecelDetails) telecelDetails.style.display = 'none';
  
  // Show the selected payment method details
  switch (method) {
    case 'card':
      if (cardDetails) cardDetails.style.display = 'block';
      break;
    case 'mtn':
      if (mtnDetails) mtnDetails.style.display = 'block';
      break;
    case 'airteltigo':
      if (airteltigoDetails) airteltigoDetails.style.display = 'block';
      break;
    case 'telecel':
      if (telecelDetails) telecelDetails.style.display = 'block';
      break;
    default:
      // For other methods (PayPal, Apple Pay, Google Pay), no additional details needed
      break;
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

// Validate MTN Mobile Money number
function validateMTNNumber(number) {
  // Remove any spaces or formatting
  const cleanNumber = number.replace(/\s/g, '');
  // MTN prefixes: 024, 025, 053, 054, 055, 059
  const mtnPrefixes = ['024', '025', '053', '054', '055', '059'];
  return cleanNumber.length === 10 && mtnPrefixes.some(prefix => cleanNumber.startsWith(prefix));
}

// Validate AirtelTigo Money number
function validateAirtelTigoNumber(number) {
  // Remove any spaces or formatting
  const cleanNumber = number.replace(/\s/g, '');
  // AirtelTigo prefixes: 026, 027, 056, 057
  const airtelTigoPrefixes = ['026', '027', '056', '057'];
  return cleanNumber.length === 10 && airtelTigoPrefixes.some(prefix => cleanNumber.startsWith(prefix));
}

// Validate Telecel Cash number
function validateTelecelNumber(number) {
  // Remove any spaces or formatting
  const cleanNumber = number.replace(/\s/g, '');
  // Telecel prefixes: 020, 050
  const telecelPrefixes = ['020', '050'];
  return cleanNumber.length === 10 && telecelPrefixes.some(prefix => cleanNumber.startsWith(prefix));
}

// Format mobile money number input
function formatMobileNumber(input) {
  let value = input.value.replace(/\D/g, '');
  // Limit to 10 digits
  if (value.length > 10) {
    value = value.substring(0, 10);
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
  
  // Validate payment method specific fields
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
  } else if (selectedPaymentMethod === 'mtn') {
    const mtnNumber = document.getElementById('mtnNumber');
    const mtnName = document.getElementById('mtnName');
    
    if (!mtnNumber.value || !validateMTNNumber(mtnNumber.value)) {
      mtnNumber.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!mtnName.value.trim()) {
      mtnName.style.borderColor = '#ef4444';
      isValid = false;
    }
  } else if (selectedPaymentMethod === 'airteltigo') {
    const airteltigoNumber = document.getElementById('airteltigoNumber');
    const airteltigoName = document.getElementById('airteltigoName');
    
    if (!airteltigoNumber.value || !validateAirtelTigoNumber(airteltigoNumber.value)) {
      airteltigoNumber.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!airteltigoName.value.trim()) {
      airteltigoName.style.borderColor = '#ef4444';
      isValid = false;
    }
  } else if (selectedPaymentMethod === 'telecel') {
    const telecelNumber = document.getElementById('telecelNumber');
    const telecelName = document.getElementById('telecelName');
    
    if (!telecelNumber.value || !validateTelecelNumber(telecelNumber.value)) {
      telecelNumber.style.borderColor = '#ef4444';
      isValid = false;
    }
    
    if (!telecelName.value.trim()) {
      telecelName.style.borderColor = '#ef4444';
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
    // Check if mobile money payment is selected
    if (['mtn', 'airteltigo', 'telecel'].includes(selectedPaymentMethod)) {
      await processMobileMoneyDemo();
      return;
    }
    
    // Simulate regular payment processing
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
  
  // Mobile money number inputs - format and validate
  const mtnNumberInput = document.getElementById('mtnNumber');
  if (mtnNumberInput) {
    mtnNumberInput.addEventListener('input', (e) => formatMobileNumber(e.target));
  }
  
  const airteltigoNumberInput = document.getElementById('airteltigoNumber');
  if (airteltigoNumberInput) {
    airteltigoNumberInput.addEventListener('input', (e) => formatMobileNumber(e.target));
  }
  
  const telecelNumberInput = document.getElementById('telecelNumber');
  if (telecelNumberInput) {
    telecelNumberInput.addEventListener('input', (e) => formatMobileNumber(e.target));
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

// Send order confirmation email with Order ID using EmailJS
async function sendOrderConfirmationEmail(orderData) {
  try {
    const customerEmail = orderData.deliveryInfo.email;
    if (!customerEmail) {
      console.log('No customer email provided, skipping email notification');
      return;
    }

    // Load EmailJS if not already loaded
    if (typeof emailjs === 'undefined') {
      await loadEmailJS();
    }

    const paymentMethodName = getPaymentMethodDisplayName(orderData.paymentMethod);
    const trackingNumber = `WW${orderData.orderId.slice(-8).toUpperCase()}`;
    
    const templateParams = {
      to_email: customerEmail,
      to_name: orderData.deliveryInfo.firstName + ' ' + orderData.deliveryInfo.lastName,
      order_id: orderData.orderId,
      tracking_number: trackingNumber,
      payment_method: paymentMethodName,
      total_amount: `GH₵${orderData.total.toFixed(2)}`,
      order_date: new Date(orderData.orderDate).toLocaleDateString(),
      items_count: orderData.items.length,
      track_url: `http://localhost:3003/track.html?orderId=${orderData.orderId}`
    };

    // Send email using Formspree (simpler alternative)
    const response = await fetch('https://formspree.io/f/xpznvqko', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customerEmail,
        subject: `Order Confirmed - ${orderData.orderId} | Wood & Whimsy`,
        message: `
🎉 ORDER CONFIRMED!

Dear ${orderData.deliveryInfo.firstName} ${orderData.deliveryInfo.lastName},

Your ${paymentMethodName} payment has been processed successfully!

ORDER DETAILS:
• Order ID: ${orderData.orderId}
• Tracking Number: ${trackingNumber}
• Payment Method: ${paymentMethodName}
• Total: GH₵${orderData.total.toFixed(2)}
• Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
• Items: ${orderData.items.length} item(s)

Track your order: http://localhost:3003/track.html?orderId=${orderData.orderId}

Delivery Address:
${orderData.deliveryInfo.address}
${orderData.deliveryInfo.city}, ${orderData.deliveryInfo.state} ${orderData.deliveryInfo.zipCode}

Thank you for choosing Wood & Whimsy!

Best regards,
Wood & Whimsy Team
        `
      })
    });

    if (response.ok) {
      console.log('📧 Email sent successfully via Formspree');
      return { success: true, email: customerEmail };
    } else {
      throw new Error('Failed to send email');
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Show what would be sent
    console.log(`📧 EMAIL DETAILS FOR: ${customerEmail}`);
    console.log(`Order ID: ${orderData.orderId}`);
    console.log(`Tracking: WW${orderData.orderId.slice(-8).toUpperCase()}`);
    
    return { success: false, error: error.message };
  }
}

// Load EmailJS library
async function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('emailjs-script')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'emailjs-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      emailjs.init('YOUR_PUBLIC_KEY');
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Get payment method display name
function getPaymentMethodDisplayName(paymentMethod) {
  switch (paymentMethod) {
    case 'mtn': return 'MTN Mobile Money';
    case 'airteltigo': return 'AirtelTigo Money';
    case 'telecel': return 'Telecel Cash';
    case 'card': return 'Credit/Debit Card';
    default: return paymentMethod || 'Unknown';
  }
}

// Demo Mobile Money Payment Processing
async function processMobileMoneyDemo() {
  const placeOrderBtn = document.querySelector('.place-order-btn');
  
  // Get payment details
  const phoneNumber = getSelectedMobileNumber();
  const customerName = getSelectedCustomerName();
  const total = calculateTotal();
  
  // Show initial processing
  placeOrderBtn.innerHTML = '📱 Initiating Mobile Money Payment...';
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Show provider-specific simulation
  await showMobileMoneySimulation(selectedPaymentMethod, phoneNumber, customerName, total);
}

// Get selected mobile money number
function getSelectedMobileNumber() {
  switch (selectedPaymentMethod) {
    case 'mtn':
      return document.getElementById('mtnNumber').value;
    case 'airteltigo':
      return document.getElementById('airteltigoNumber').value;
    case 'telecel':
      return document.getElementById('telecelNumber').value;
    default:
      return '';
  }
}

// Get selected customer name
function getSelectedCustomerName() {
  switch (selectedPaymentMethod) {
    case 'mtn':
      return document.getElementById('mtnName').value;
    case 'airteltigo':
      return document.getElementById('airteltigoName').value;
    case 'telecel':
      return document.getElementById('telecelName').value;
    default:
      return '';
  }
}

// Show mobile money simulation based on provider
async function showMobileMoneySimulation(provider, phoneNumber, customerName, total) {
  const placeOrderBtn = document.querySelector('.place-order-btn');
  
  // Create simulation modal
  const simulationModal = createSimulationModal(provider, phoneNumber, customerName, total);
  document.body.appendChild(simulationModal);
  
  // Show sending request
  placeOrderBtn.innerHTML = '📤 Sending payment request...';
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Show provider-specific prompt
  updateSimulationStep(provider, 'prompt');
  placeOrderBtn.innerHTML = '⏳ Waiting for customer authorization...';
  
  // Simulate customer receiving prompt
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Show customer authorization step
  updateSimulationStep(provider, 'authorize');
  
  // Wait for simulated authorization
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Show success
  updateSimulationStep(provider, 'success');
  placeOrderBtn.innerHTML = '✅ Payment Successful!';
  
  // Complete the order
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Close simulation and complete order
  simulationModal.remove();
  await completeOrder();
}

// Create simulation modal
function createSimulationModal(provider, phoneNumber, customerName, total) {
  const modal = document.createElement('div');
  modal.className = 'simulation-modal';
  modal.id = 'mobile-money-simulation';
  
  const providerInfo = {
    mtn: {
      name: 'MTN Mobile Money',
      color: '#FFCC00',
      icon: '📱',
      ussd: '*170#'
    },
    airteltigo: {
      name: 'AirtelTigo Money',
      color: '#E60012',
      icon: '📲',
      ussd: '*110#'
    },
    telecel: {
      name: 'Telecel Cash',
      color: '#00A651',
      icon: '💰',
      ussd: 'SMS'
    }
  };
  
  const info = providerInfo[provider];
  
  modal.innerHTML = `
    <div class="simulation-overlay"></div>
    <div class="simulation-content">
      <div class="simulation-header">
        <h3>${info.icon} ${info.name} Payment Demo</h3>
        <p>Simulating real mobile money payment flow</p>
      </div>
      
      <div class="simulation-details">
        <div class="detail-row">
          <span>Customer:</span>
          <span>${customerName}</span>
        </div>
        <div class="detail-row">
          <span>Phone Number:</span>
          <span>${phoneNumber}</span>
        </div>
        <div class="detail-row">
          <span>Amount:</span>
          <span>GH₵${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="simulation-steps">
        <div class="step" id="step-request">
          <div class="step-icon">📤</div>
          <div class="step-content">
            <h4>1. Payment Request Sent</h4>
            <p>Sending payment request to ${info.name} servers...</p>
          </div>
          <div class="step-status">⏳</div>
        </div>
        
        <div class="step" id="step-prompt">
          <div class="step-icon">${info.icon}</div>
          <div class="step-content">
            <h4>2. Customer Receives Prompt</h4>
            <p id="prompt-message">Customer will receive ${info.ussd === 'SMS' ? 'SMS' : 'USSD'} prompt...</p>
          </div>
          <div class="step-status">⏳</div>
        </div>
        
        <div class="step" id="step-authorize">
          <div class="step-icon">🔐</div>
          <div class="step-content">
            <h4>3. Customer Authorization</h4>
            <p>Customer enters PIN to authorize payment...</p>
          </div>
          <div class="step-status">⏳</div>
        </div>
        
        <div class="step" id="step-success">
          <div class="step-icon">✅</div>
          <div class="step-content">
            <h4>4. Payment Confirmed</h4>
            <p>Payment successful! Both parties receive SMS confirmation.</p>
          </div>
          <div class="step-status">⏳</div>
        </div>
      </div>
      
      <div class="phone-simulation" id="phone-display">
        <div class="phone-screen">
          <div class="phone-header">${info.name}</div>
          <div class="phone-content" id="phone-content">
            <p>Initializing payment request...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    .simulation-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .simulation-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .simulation-content {
      position: relative;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .simulation-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .simulation-header h3 {
      color: ${info.color};
      margin-bottom: 0.5rem;
    }
    
    .simulation-details {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 2rem;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .simulation-steps {
      margin-bottom: 2rem;
    }
    
    .step {
      display: flex;
      align-items: center;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 10px;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;
    }
    
    .step.active {
      border-color: ${info.color};
      background: rgba(255, 204, 0, 0.1);
    }
    
    .step.completed {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
    
    .step-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-content h4 {
      margin-bottom: 0.25rem;
      color: #333;
    }
    
    .step-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .step-status {
      font-size: 1.2rem;
    }
    
    .phone-simulation {
      background: #333;
      border-radius: 25px;
      padding: 1rem;
      margin-top: 2rem;
    }
    
    .phone-screen {
      background: #000;
      border-radius: 15px;
      padding: 1rem;
      color: #0f0;
      font-family: monospace;
      min-height: 150px;
    }
    
    .phone-header {
      text-align: center;
      font-weight: bold;
      margin-bottom: 1rem;
      color: ${info.color};
    }
    
    .phone-content {
      font-size: 0.9rem;
      line-height: 1.4;
    }
  `;
  document.head.appendChild(styles);
  
  return modal;
}

// Update simulation step
function updateSimulationStep(provider, step) {
  const providerInfo = {
    mtn: { name: 'MTN Mobile Money', ussd: '*170#' },
    airteltigo: { name: 'AirtelTigo Money', ussd: '*110#' },
    telecel: { name: 'Telecel Cash', ussd: 'SMS' }
  };
  
  const info = providerInfo[provider];
  const phoneContent = document.getElementById('phone-content');
  
  // Reset all steps
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active', 'completed');
    s.querySelector('.step-status').textContent = '⏳';
  });
  
  switch (step) {
    case 'prompt':
      document.getElementById('step-request').classList.add('completed');
      document.getElementById('step-request').querySelector('.step-status').textContent = '✅';
      document.getElementById('step-prompt').classList.add('active');
      
      if (info.ussd === 'SMS') {
        phoneContent.innerHTML = `
          <div style="color: #0f0;">📱 NEW MESSAGE</div>
          <div style="margin: 1rem 0; padding: 0.5rem; border: 1px solid #0f0;">
            From: Telecel<br>
            Pay GH₵${calculateTotal().toFixed(2)} to Wood & Whimsy?<br>
            Reply with PIN to confirm.
          </div>
          <div style="color: #ff0;">⏳ Waiting for customer response...</div>
        `;
      } else {
        phoneContent.innerHTML = `
          <div style="color: #0f0;">${info.ussd}</div>
          <div style="margin: 1rem 0;">
            1. Send Money<br>
            2. Buy Airtime<br>
            3. Pay Bills<br>
            <span style="color: #ff0;">► 4. Approve Payment</span>
          </div>
          <div style="border: 1px solid #0f0; padding: 0.5rem; margin: 0.5rem 0;">
            Pay GH₵${calculateTotal().toFixed(2)}<br>
            To: Wood & Whimsy<br>
            Enter PIN: ****
          </div>
        `;
      }
      break;
      
    case 'authorize':
      document.getElementById('step-prompt').classList.add('completed');
      document.getElementById('step-prompt').querySelector('.step-status').textContent = '✅';
      document.getElementById('step-authorize').classList.add('active');
      
      phoneContent.innerHTML = `
        <div style="color: #0f0;">🔐 AUTHORIZATION</div>
        <div style="margin: 1rem 0;">
          Processing payment...<br>
          Amount: GH₵${calculateTotal().toFixed(2)}<br>
          To: Wood & Whimsy<br>
        </div>
        <div style="color: #ff0; text-align: center;">
          ⏳ Please wait...
        </div>
      `;
      break;
      
    case 'success':
      document.getElementById('step-authorize').classList.add('completed');
      document.getElementById('step-authorize').querySelector('.step-status').textContent = '✅';
      document.getElementById('step-success').classList.add('active');
      
      phoneContent.innerHTML = `
        <div style="color: #0f0;">✅ PAYMENT SUCCESSFUL</div>
        <div style="margin: 1rem 0; border: 1px solid #0f0; padding: 0.5rem;">
          Transaction ID: ${generateOrderId()}<br>
          Amount: GH₵${calculateTotal().toFixed(2)}<br>
          To: Wood & Whimsy<br>
          Balance: GH₵1,234.56
        </div>
        <div style="color: #0f0; text-align: center;">
          SMS receipt sent!
        </div>
      `;
      
      setTimeout(() => {
        document.getElementById('step-success').classList.add('completed');
        document.getElementById('step-success').querySelector('.step-status').textContent = '✅';
      }, 1000);
      break;
  }
}

// Complete order after successful mobile money payment
async function completeOrder() {
  // Get form data and create order
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
    mobileMoneyDetails: {
      phoneNumber: getSelectedMobileNumber(),
      customerName: getSelectedCustomerName(),
      provider: selectedPaymentMethod
    },
    total: calculateTotal(),
    orderDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: getEstimatedDelivery(),
    deliveryAddress: getDeliveryAddress(Object.fromEntries(formData)),
    orderId: orderId,
    status: 'paid',
    currentStatus: 'confirmed',
    timeline: createInitialTimeline(),
    createdAt: new Date().toISOString()
  };
  
  // Save order to localStorage (Firebase will be attempted in regular flow)
  try {
    // Always save to localStorage as fallback
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Try Firebase if available
    if (typeof db !== 'undefined' && typeof doc !== 'undefined') {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, {
        ...orderData,
        createdAt: serverTimestamp()
      });
      
      if (currentUser) {
        const userOrderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
        await setDoc(userOrderRef, {
          orderId: orderId,
          total: orderData.total,
          status: 'paid',
          orderDate: serverTimestamp(),
          itemCount: cart.length
        });
        
        const userCartRef = doc(db, 'carts', currentUser.uid);
        await deleteDoc(userCartRef);
      }
    }
  } catch (error) {
    console.error('Error saving order to Firebase, using localStorage:', error);
  }
  
  // Clear cart
  localStorage.removeItem('cart');
  cart = [];
  
  // Send order confirmation email
  await sendOrderConfirmationEmail(orderData);
  
  // Show success and redirect
  showNotification('🎉 Mobile Money payment successful! Order confirmed. Check your email for details.', 'success');
  
  setTimeout(() => {
    window.location.href = `order-confirmation.html?orderId=${orderData.orderId}`;
  }, 2000);
}
