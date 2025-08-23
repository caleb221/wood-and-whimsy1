// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { emailService } from './email-service.js';

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
let currentUser = null;
let emailNotificationsEnabled = false;

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  loadNotificationSettings();
});

// Enhanced order tracking data with realistic timeline
const orderStatuses = {
  'processing': {
    name: 'Order Processing',
    description: 'Your order is being prepared and verified',
    icon: '📋',
    color: '#f59e0b'
  },
  'confirmed': {
    name: 'Order Confirmed',
    description: 'Payment confirmed and order accepted',
    icon: '✅',
    color: '#10b981'
  },
  'manufacturing': {
    name: 'In Production',
    description: 'Your furniture is being crafted with care',
    icon: '🔨',
    color: '#6366f1'
  },
  'quality_check': {
    name: 'Quality Inspection',
    description: 'Final quality checks and packaging',
    icon: '🔍',
    color: '#8b5cf6'
  },
  'shipped': {
    name: 'Shipped',
    description: 'Your order is on its way to you',
    icon: '🚚',
    color: '#3b82f6'
  },
  'out_for_delivery': {
    name: 'Out for Delivery',
    description: 'Your order is out for delivery today',
    icon: '🚛',
    color: '#f97316'
  },
  'delivered': {
    name: 'Delivered',
    description: 'Your order has been successfully delivered',
    icon: '🎉',
    color: '#10b981'
  }
};

// Sample order data (in production, this would come from your database)
const sampleOrders = {
  'WW12345678': {
    orderId: 'WW12345678',
    orderDate: '2025-08-08',
    estimatedDelivery: '2025-08-15',
    customerEmail: 'customer@example.com',
    deliveryAddress: '123 Main St, Accra, Ghana',
    items: [
      { name: 'Cozy Cloud Sofa', quantity: 1, price: 1299 },
      { name: 'Harmony Dining Table', quantity: 1, price: 899 }
    ],
    currentStatus: 'shipped',
    timeline: [
      {
        status: 'processing',
        date: '2025-08-08T10:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'confirmed',
        date: '2025-08-08T14:30:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'manufacturing',
        date: '2025-08-09T08:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'quality_check',
        date: '2025-08-10T16:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'shipped',
        date: '2025-08-11T09:00:00Z',
        location: 'Accra Distribution Center',
        completed: true,
        current: true
      },
      {
        status: 'out_for_delivery',
        date: '2025-08-15T07:00:00Z',
        location: 'Local Delivery Hub',
        completed: false
      },
      {
        status: 'delivered',
        date: '2025-08-15T18:00:00Z',
        location: 'Customer Address',
        completed: false
      }
    ]
  },
  'WW87654321': {
    orderId: 'WW87654321',
    orderDate: '2025-08-10',
    estimatedDelivery: '2025-08-18',
    customerEmail: 'customer2@example.com',
    deliveryAddress: '456 Oak Avenue, Kumasi, Ghana',
    items: [
      { name: 'Executive Office Chair', quantity: 2, price: 599 }
    ],
    currentStatus: 'manufacturing',
    timeline: [
      {
        status: 'processing',
        date: '2025-08-10T11:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'confirmed',
        date: '2025-08-10T15:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true
      },
      {
        status: 'manufacturing',
        date: '2025-08-11T08:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: true,
        current: true
      },
      {
        status: 'quality_check',
        date: '2025-08-14T16:00:00Z',
        location: 'Wood & Whimsy Workshop',
        completed: false
      },
      {
        status: 'shipped',
        date: '2025-08-16T09:00:00Z',
        location: 'Kumasi Distribution Center',
        completed: false
      },
      {
        status: 'out_for_delivery',
        date: '2025-08-18T07:00:00Z',
        location: 'Local Delivery Hub',
        completed: false
      },
      {
        status: 'delivered',
        date: '2025-08-18T18:00:00Z',
        location: 'Customer Address',
        completed: false
      }
    ]
  }
};

// Track order function
async function trackOrder() {
  const orderInput = document.getElementById('orderInput');
  const trackBtn = document.getElementById('trackBtn');
  const errorMessage = document.getElementById('errorMessage');
  const orderDetails = document.getElementById('orderDetails');
  
  const orderNumber = orderInput.value.trim().toUpperCase();
  
  if (!orderNumber) {
    showError('Please enter an order number');
    return;
  }
  
  // Show loading state
  trackBtn.innerHTML = '<span class="loading"></span> Tracking...';
  trackBtn.disabled = true;
  hideError();
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try to get order from Firebase first (for real orders)
    let orderData = await getOrderFromFirebase(orderNumber);
    
    // If not found in Firebase, check sample data
    if (!orderData && sampleOrders[orderNumber]) {
      orderData = sampleOrders[orderNumber];
    }
    
    if (orderData) {
      displayOrderDetails(orderData);
      orderDetails.style.display = 'block';
      
      // Send email notification if enabled
      if (emailNotificationsEnabled && currentUser) {
        await sendTrackingEmail(orderData, currentUser.email);
      }
    } else {
      showError(`Order ${orderNumber} not found. Please check your order number and try again.`);
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    showError('Unable to track order at this time. Please try again later.');
  } finally {
    trackBtn.innerHTML = 'Track Order';
    trackBtn.disabled = false;
  }
}

// Get order from Firebase
async function getOrderFromFirebase(orderNumber) {
  try {
    const ordersRef = collection(db, 'orders');
    let q;
    
    if (currentUser) {
      // Query with user authentication
      q = query(ordersRef, where('orderId', '==', orderNumber), where('userId', '==', currentUser.uid));
    } else {
      // Query without user authentication (for guest orders)
      q = query(ordersRef, where('orderId', '==', orderNumber));
    }
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const orderDoc = querySnapshot.docs[0];
      return { id: orderDoc.id, ...orderDoc.data() };
    }
  } catch (error) {
    console.error('Error fetching order from Firebase:', error);
  }
  
  // Try localStorage as fallback
  try {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const order = orders.find(o => o.orderId === orderNumber);
      if (order) {
        console.log('Order found in localStorage:', order);
        return order;
      }
    }
  } catch (error) {
    console.error('Error checking localStorage for orders:', error);
  }
  
  return null;
}

// Display order details
function displayOrderDetails(orderData) {
  // Update order info cards
  document.getElementById('orderNumber').textContent = orderData.orderId;
  document.getElementById('orderDate').textContent = formatDate(orderData.orderDate);
  document.getElementById('estimatedDelivery').textContent = formatDate(orderData.estimatedDelivery);
  document.getElementById('deliveryAddress').textContent = orderData.deliveryAddress;
  
  // Create timeline
  createTimeline(orderData.timeline);
  
  // Initialize interactive map
  initializeDeliveryMap(orderData);
}

// Create timeline visualization
function createTimeline(timeline) {
  const container = document.getElementById('timelineContainer');
  container.innerHTML = '';
  
  timeline.forEach((item, index) => {
    const statusInfo = orderStatuses[item.status];
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    let dotClass = 'timeline-dot';
    let statusClass = 'timeline-status';
    
    if (item.completed) {
      dotClass += ' completed';
      statusClass += ' completed';
    } else if (item.current) {
      dotClass += ' current';
      statusClass += ' current';
    } else {
      statusClass += ' pending';
    }
    
    timelineItem.innerHTML = `
      <div class="${dotClass}">${statusInfo.icon}</div>
      <div class="${statusClass}">${statusInfo.name}</div>
      <div class="timeline-date">${formatDateTime(item.date)}</div>
      <div class="timeline-description">
        ${statusInfo.description}<br>
        <small>📍 ${item.location}</small>
      </div>
    `;
    
    container.appendChild(timelineItem);
  });
}

// Send tracking email notification
async function sendTrackingEmail(orderData, email) {
  try {
    // Use the email service to send professional tracking emails
    const result = await emailService.sendTrackingEmail(orderData, email, orderData.currentStatus);
    
    if (result.success) {
      showNotification('📧 Tracking report sent to your email!', 'success');
      console.log('Email notification sent successfully:', result.emailData.subject);
    } else {
      throw new Error('Email service returned failure');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    showNotification('Unable to send email notification. Please try again later.', 'error');
    
    // Fallback: Store notification request for manual processing
    try {
      if (currentUser) {
        const notificationsRef = collection(db, 'emailNotifications');
        await addDoc(notificationsRef, {
          to: email,
          orderId: orderData.orderId,
          status: orderData.currentStatus,
          requestedAt: serverTimestamp(),
          userId: currentUser.uid,
          failed: true,
          error: error.message
        });
      }
    } catch (fallbackError) {
      console.error('Error storing fallback notification:', fallbackError);
    }
  }
}

// Generate email body
function generateEmailBody(orderData) {
  const currentStatusInfo = orderStatuses[orderData.currentStatus];
  
  return `
    Dear Valued Customer,
    
    Here's the latest update on your Wood & Whimsy order:
    
    Order Number: ${orderData.orderId}
    Current Status: ${currentStatusInfo.name}
    Estimated Delivery: ${formatDate(orderData.estimatedDelivery)}
    Delivery Address: ${orderData.deliveryAddress}
    
    ${currentStatusInfo.description}
    
    You can track your order in real-time at: https://wood-whimsy.com/track.html
    
    Thank you for choosing Wood & Whimsy!
    
    Best regards,
    The Wood & Whimsy Team
  `;
}

// Notification settings
function toggleEmailNotifications() {
  const toggle = document.getElementById('emailToggle');
  emailNotificationsEnabled = !emailNotificationsEnabled;
  
  if (emailNotificationsEnabled) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
  
  saveNotificationSettings();
  
  const message = emailNotificationsEnabled 
    ? '📧 Email notifications enabled' 
    : '📧 Email notifications disabled';
  showNotification(message, 'info');
}

// Save notification settings
function saveNotificationSettings() {
  localStorage.setItem('emailNotifications', emailNotificationsEnabled.toString());
  
  // Also save to Firebase if user is logged in
  if (currentUser) {
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, {
      emailNotifications: emailNotificationsEnabled,
      updatedAt: serverTimestamp()
    }).catch(error => {
      console.error('Error saving notification settings:', error);
    });
  }
}

// Load notification settings
function loadNotificationSettings() {
  const saved = localStorage.getItem('emailNotifications');
  emailNotificationsEnabled = saved === 'true';
  
  const toggle = document.getElementById('emailToggle');
  if (toggle) {
    if (emailNotificationsEnabled) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.style.display = 'none';
}

function showNotification(message, type = 'info') {
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
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const trackBtn = document.getElementById('trackBtn');
  const orderInput = document.getElementById('orderInput');
  const emailToggle = document.getElementById('emailToggle');
  
  if (trackBtn) {
    trackBtn.addEventListener('click', trackOrder);
  }
  
  if (orderInput) {
    orderInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        trackOrder();
      }
    });
  }
  
  if (emailToggle) {
    emailToggle.addEventListener('click', toggleEmailNotifications);
  }
  
  // Load settings on page load
  loadNotificationSettings();
});

// Interactive Map Implementation
let deliveryMap = null;
let driverMarker = null;
let routeLine = null;

// Initialize delivery map
function initializeDeliveryMap(orderData) {
  const mapContainer = document.getElementById('deliveryMap');
  if (!mapContainer) return;
  
  // Clear existing map content
  mapContainer.innerHTML = '';
  
  // Create map background with Ghana-like appearance
  const mapBackground = document.createElement('div');
  mapBackground.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 50%, #80c5ff 100%);
    position: relative;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 30%);
  `;
  mapContainer.appendChild(mapBackground);
  
  // Add location markers based on order status
  createLocationMarkers(mapBackground, orderData);
  
  // Add delivery route
  createDeliveryRoute(mapBackground, orderData);
  
  // Update map info
  updateMapInfo(orderData);
  
  // Set up map controls
  setupMapControls(orderData);
  
  // Start driver animation if order is shipped
  if (orderData.currentStatus === 'shipped' || orderData.currentStatus === 'out_for_delivery') {
    startDriverAnimation();
  }
}

// Create location markers on the map
function createLocationMarkers(mapContainer, orderData) {
  const locations = [
    {
      id: 'workshop',
      name: 'Wood & Whimsy Workshop',
      position: { x: 15, y: 60 },
      icon: '🏭',
      class: 'workshop',
      tooltip: 'Nsawam Dobro 142, Akuapim District'
    },
    {
      id: 'distribution',
      name: 'Distribution Center',
      position: { x: 45, y: 40 },
      icon: '📦',
      class: 'delivery',
      tooltip: 'Regional Distribution Hub'
    },
    {
      id: 'customer',
      name: 'Delivery Address',
      position: { x: 80, y: 25 },
      icon: '🏠',
      class: 'delivery',
      tooltip: orderData.deliveryAddress
    }
  ];
  
  locations.forEach(location => {
    const marker = document.createElement('div');
    marker.className = `map-marker ${location.class}`;
    marker.style.left = `${location.position.x}%`;
    marker.style.top = `${location.position.y}%`;
    marker.innerHTML = location.icon;
    marker.title = location.tooltip;
    marker.id = `marker-${location.id}`;
    
    marker.addEventListener('click', () => {
      showLocationInfo(location);
    });
    
    mapContainer.appendChild(marker);
  });
  
  // Add driver marker if order is in transit
  if (orderData.currentStatus === 'shipped' || orderData.currentStatus === 'out_for_delivery') {
    const driverPos = calculateDriverPosition(orderData);
    driverMarker = document.createElement('div');
    driverMarker.className = 'map-marker driver';
    driverMarker.style.left = `${driverPos.x}%`;
    driverMarker.style.top = `${driverPos.y}%`;
    driverMarker.innerHTML = '🚚';
    driverMarker.title = 'Delivery Driver - John Doe';
    driverMarker.id = 'driver-marker';
    
    mapContainer.appendChild(driverMarker);
  }
}

// Create delivery route line
function createDeliveryRoute(mapContainer, orderData) {
  const route = document.createElement('div');
  route.className = 'delivery-route';
  
  // Calculate route path (simplified straight line for demo)
  const startX = 15;
  const startY = 60;
  const endX = 80;
  const endY = 25;
  
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  route.style.cssText = `
    left: ${startX}%;
    top: ${startY}%;
    width: ${length}%;
    transform: rotate(${angle}deg);
    transform-origin: 0 50%;
  `;
  
  mapContainer.appendChild(route);
  
  // Add progress indicator
  const progress = document.createElement('div');
  progress.className = 'route-progress';
  progress.style.width = getDeliveryProgress(orderData) + '%';
  route.appendChild(progress);
  
  routeLine = route;
}

// Calculate driver position based on order status
function calculateDriverPosition(orderData) {
  const progress = getDeliveryProgress(orderData) / 100;
  const startX = 15, startY = 60;
  const endX = 80, endY = 25;
  
  return {
    x: startX + (endX - startX) * progress,
    y: startY + (endY - startY) * progress
  };
}

// Get delivery progress percentage
function getDeliveryProgress(orderData) {
  switch (orderData.currentStatus) {
    case 'processing':
    case 'confirmed':
    case 'manufacturing':
    case 'quality_check':
      return 0;
    case 'shipped':
      return 65;
    case 'out_for_delivery':
      return 90;
    case 'delivered':
      return 100;
    default:
      return 0;
  }
}

// Update map information
function updateMapInfo(orderData) {
  const progress = getDeliveryProgress(orderData);
  const totalDistance = 45; // km (example)
  const remainingDistance = Math.round(totalDistance * (100 - progress) / 100);
  
  document.getElementById('distanceRemaining').textContent = 
    remainingDistance > 0 ? `${remainingDistance} km` : 'Delivered';
  
  const estimatedMinutes = remainingDistance * 2; // 2 minutes per km
  const arrivalTime = new Date(Date.now() + estimatedMinutes * 60000);
  document.getElementById('estimatedArrival').textContent = 
    remainingDistance > 0 ? arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Completed';
}

// Setup map control buttons
function setupMapControls(orderData) {
  const centerBtn = document.getElementById('centerMapBtn');
  const routeBtn = document.getElementById('showRouteBtn');
  const trackBtn = document.getElementById('trackDriverBtn');
  
  if (centerBtn) {
    centerBtn.addEventListener('click', () => {
      centerMapOnDelivery();
      showNotification('📍 Map centered on delivery address', 'info');
    });
  }
  
  if (routeBtn) {
    routeBtn.addEventListener('click', () => {
      highlightRoute();
      showNotification('🛣️ Delivery route highlighted', 'info');
    });
  }
  
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      if (orderData.currentStatus === 'shipped' || orderData.currentStatus === 'out_for_delivery') {
        trackDriver();
        showNotification('🚚 Following driver location', 'info');
      } else {
        showNotification('Driver tracking available when order is shipped', 'info');
      }
    });
  }
}

// Map control functions
function centerMapOnDelivery() {
  const customerMarker = document.getElementById('marker-customer');
  if (customerMarker) {
    customerMarker.style.transform = 'rotate(-45deg) scale(1.3)';
    setTimeout(() => {
      customerMarker.style.transform = 'rotate(-45deg) scale(1)';
    }, 1000);
  }
}

function highlightRoute() {
  if (routeLine) {
    routeLine.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.6)';
    routeLine.style.height = '5px';
    setTimeout(() => {
      routeLine.style.boxShadow = 'none';
      routeLine.style.height = '3px';
    }, 2000);
  }
}

function trackDriver() {
  if (driverMarker) {
    driverMarker.style.transform = 'rotate(-45deg) scale(1.5)';
    driverMarker.style.zIndex = '20';
    setTimeout(() => {
      driverMarker.style.transform = 'rotate(-45deg) scale(1)';
      driverMarker.style.zIndex = '10';
    }, 2000);
  }
}

// Start driver animation
function startDriverAnimation() {
  if (!driverMarker) return;
  
  let animationStep = 0;
  const animateDriver = () => {
    if (driverMarker) {
      const offset = Math.sin(animationStep * 0.1) * 2;
      driverMarker.style.transform = `rotate(-45deg) translateX(${offset}px)`;
      animationStep++;
    }
  };
  
  setInterval(animateDriver, 100);
}

// Show location information
function showLocationInfo(location) {
  const info = document.createElement('div');
  info.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 1000;
    max-width: 300px;
  `;
  
  info.innerHTML = `
    <h3 style="margin: 0 0 1rem 0; color: #2d3748;">${location.icon} ${location.name}</h3>
    <p style="margin: 0 0 1rem 0; color: #4a5568;">${location.tooltip}</p>
    <button onclick="this.parentElement.remove()" style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
  `;
  
  document.body.appendChild(info);
  
  setTimeout(() => {
    if (info.parentElement) {
      info.remove();
    }
  }, 5000);
}

// Auto-update tracking (simulate real-time updates)
setInterval(async () => {
  const orderDetails = document.getElementById('orderDetails');
  if (orderDetails.style.display === 'block') {
    // In a real application, this would fetch fresh data from your API
    console.log('Auto-updating tracking information...');
    
    // Simulate driver movement
    if (driverMarker) {
      const currentLeft = parseFloat(driverMarker.style.left);
      const currentTop = parseFloat(driverMarker.style.top);
      const targetX = 80;
      const targetY = 25;
      
      // Move driver slightly towards destination
      const newX = currentLeft + (targetX - currentLeft) * 0.01;
      const newY = currentTop + (targetY - currentTop) * 0.01;
      
      driverMarker.style.left = `${newX}%`;
      driverMarker.style.top = `${newY}%`;
    }
  }
}, 30000); // Update every 30 seconds

// Check for order ID in URL parameters and auto-populate
function checkURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdFromURL = urlParams.get('orderId');
  
  if (orderIdFromURL) {
    const orderInput = document.getElementById('orderInput');
    if (orderInput) {
      orderInput.value = orderIdFromURL;
      // Auto-track the order if it came from URL
      trackOrder();
    }
  }
}

// Initialize URL parameter checking when page loads
document.addEventListener('DOMContentLoaded', checkURLParameters);

console.log('🚚 Order tracking system with interactive map loaded successfully!');
