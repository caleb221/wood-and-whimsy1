// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
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
const googleProvider = new GoogleAuthProvider();

// Authentication state management for main page
let currentUser = null;

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateUserDisplay(user);
  
  if (user) {
    // Load cart from Firestore when user signs in
    await loadCartFromFirestore();
    console.log('Auth state changed on main page:', `${user.displayName} (${user.email})`);
  } else {
    console.log('Auth state changed on main page: No user');
  }
});

// Update user display in navigation
function updateUserDisplay(user) {
  const authNavItem = document.getElementById('auth-nav-item');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  
  if (user) {
    // User is signed in - show user profile, hide sign in link
    if (authNavItem) authNavItem.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    // Set user information
    if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
    if (userAvatar) {
      userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff&size=40`;
    }
    
    console.log('User display updated:', user.displayName);
  } else {
    // User is signed out - show sign in link, hide user profile
    if (authNavItem) authNavItem.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    
    console.log('User display cleared');
  }
}

// Sign out function
async function signOutUser() {
  try {
    await signOut(auth);
    showNotification('Successfully signed out!', 'success');
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Error signing out. Please try again.', 'error');
  }
}

// Save cart to Firestore (for authenticated users)
async function saveCartToFirestore() {
  if (!currentUser) return;
  
  try {
    const userCartRef = doc(db, 'carts', currentUser.uid);
    await setDoc(userCartRef, {
      items: cart,
      updatedAt: serverTimestamp(),
      userId: currentUser.uid
    });
    console.log('Cart saved to Firestore');
  } catch (error) {
    console.error('Error saving cart to Firestore:', error);
  }
}

// Load cart from Firestore (for authenticated users)
async function loadCartFromFirestore() {
  if (!currentUser) return;
  
  try {
    const userCartRef = doc(db, 'carts', currentUser.uid);
    const cartSnap = await getDoc(userCartRef);
    
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      cart = cartData.items || [];
      updateCartDisplay();
      console.log('Cart loaded from Firestore');
    }
  } catch (error) {
    console.error('Error loading cart from Firestore:', error);
  }
}

// Clear cart from Firestore
async function clearCartFromFirestore() {
  if (!currentUser) return;
  
  try {
    const userCartRef = doc(db, 'carts', currentUser.uid);
    await deleteDoc(userCartRef);
    console.log('Cart cleared from Firestore');
  } catch (error) {
    console.error('Error clearing cart from Firestore:', error);
  }
}

// Proceed to checkout function
async function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty. Please add items before checkout.', 'error');
    return;
  }
  
  // Close cart sidebar
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.querySelector('.cart-overlay');
  if (cartSidebar) cartSidebar.classList.remove('active');
  if (cartOverlay) cartOverlay.style.display = 'none';
  
  // Save cart to Firestore if user is authenticated
  if (currentUser) {
    try {
      await saveCartToFirestore();
      console.log('Cart saved to Firestore before checkout');
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
      // Continue to checkout even if Firestore save fails
    }
  }
  
  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

// Product data with updated friendly names and prices
const products = {
  1: {
    id: 1,
    name: "Cozy Cloud Sofa",
    price: 1299,
    originalPrice: 1499,
    image: "cozy%20sofa.jpg",
    rating: 4.8,
    reviews: 124,
  },
  2: {
    id: 2,
    name: "Harmony Dining Table",
    price: 899,
    image: "harmony%20dining%20table.jpg",
    rating: 4.9,
    reviews: 89,
  },
  3: {
    id: 3,
    name: "Crystal Coffee Table",
    price: 449,
    image: "glass.jpeg",
    rating: 4.7,
    reviews: 156,
  },
  4: {
    id: 4,
    name: "Dream Queen Bed",
    price: 799,
    originalPrice: 999,
    image: "bed.jpg",
    rating: 4.9,
    reviews: 203,
  },
  5: {
    id: 5,
    name: "Executive Comfort Chair",
    price: 349,
    image: "executive.jpg",
    rating: 4.6,
    reviews: 78,
  },
  6: {
    id: 6,
    name: "Industrial Bookshelf",
    price: 229,
    image: "book%20shelf.jpg",
    rating: 4.8,
    reviews: 92,
  },
}

// Shopping cart and favorites
let cart = []
let favorites = []

// Make cart globally accessible immediately
window.cart = cart;

// Global DOM element variables
let cartSidebar, cartOverlay, cartItems, cartTotal, cartCount
let authModal, authForm, authError, authModalTitle, submitText, toggleText, toggleLink, nameGroup, confirmPasswordGroup, confirmPassword
let isSignUp = false

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateUserInterface(user);
});

// Update UI based on authentication state
function updateUserInterface(user) {
  const signInLink = document.querySelector('a[href="signin.html"]');
  
  if (user) {
    // User is signed in
    if (signInLink) {
      signInLink.innerHTML = `
        <div class="user-profile">
          <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email) + '&background=10b981&color=fff'}" 
               alt="${user.displayName || user.email}" 
               class="user-avatar">
          <span class="user-name">${user.displayName || user.email.split('@')[0]}</span>
          <button class="logout-btn" onclick="signOutUser()">Logout</button>
        </div>
      `;
      signInLink.href = "#";
    }
  } else {
    // User is signed out
    if (signInLink) {
      signInLink.innerHTML = 'Sign In';
      signInLink.href = "signin.html";
    }
  }
}

// Authentication functions are handled in auth.js

// Close auth modal function is defined below as window.closeAuthModal

// Define addToCart function globally FIRST - replace the placeholder
window.fullAddToCart = async function(productId) {
  console.log('Full addToCart function called with productId:', productId);
  
  try {
    const product = products[productId];
    console.log('Product found:', product);
    
    if (!product) {
      console.error('Product not found:', productId)
      showNotification('Product not found. Please try again.', 'error')
      return
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    updateCartDisplay();
    saveCartToLocalStorage(); // Keep localStorage as backup
    await saveCartToFirestore(); // Save to Firestore for authenticated users
    showNotification(`${product.name} added to cart!`, 'success');
  } catch (error) {
    console.error('Error adding to cart:', error)
    showNotification('Something went wrong. Please try again.', 'error')
  }
};

// Replace the placeholder addToCart with the full function
window.addToCart = window.fullAddToCart;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM Content Loaded - Starting initialization');
  initializeApp();
});

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM loaded, initializing...')
  
  // Initialize DOM elements
  try {
    cartSidebar = document.getElementById("cart-sidebar")
    cartOverlay = document.querySelector(".cart-overlay")
    cartItems = document.getElementById("cart-items")
    cartTotal = document.getElementById("cart-total")
    cartCount = document.querySelector(".cart-count")
    
    console.log('DOM elements initialized:', {
      cartSidebar: !!cartSidebar,
      cartOverlay: !!cartOverlay,
      cartItems: !!cartItems,
      cartTotal: !!cartTotal,
      cartCount: !!cartCount
    })
    
    // Check if DOM elements exist
    if (!cartSidebar || !cartOverlay || !cartItems || !cartTotal || !cartCount) {
      console.warn('Some cart elements not found. Cart functionality may not work properly.');
    }
  } catch (error) {
    console.error('Error initializing DOM elements:', error);
  }

  // Add event listeners for all navigation buttons - IMMEDIATE EXECUTION
  console.log('🔍 Looking for sign in button...');
  const signInBtn = document.querySelector('#sign-in-link');
  console.log('Sign in button element:', signInBtn);
  
  if (signInBtn) {
    console.log('✅ Sign in button found, adding event listener');
    
    // Remove any existing event listeners
    signInBtn.replaceWith(signInBtn.cloneNode(true));
    const newSignInBtn = document.querySelector('#sign-in-link');
    
    newSignInBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔥🔥🔥 SIGN IN BUTTON CLICKED! 🔥🔥🔥');
      
      // Force modal open immediately
      const modal = document.getElementById('auth-modal');
      if (modal) {
        console.log('Found modal, forcing display...');
        modal.style.cssText = `
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(31,41,55,0.8) !important;
          z-index: 99999 !important;
          align-items: center !important;
          justify-content: center !important;
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal should be visible now!');
      } else {
        console.error('❌ Modal not found');
        alert('Modal not found!');
      }
      
      return false;
    });
    
    console.log('✅ Event listener added successfully');
  } else {
    console.error('❌ Sign in button not found in DOM');
    
    // Try to find it with different selectors
    const altBtn1 = document.querySelector('.sign-in-btn');
    const altBtn2 = document.querySelector('[id*="sign"]');
    console.log('Alternative button searches:', {
      'sign-in-btn class': !!altBtn1,
      'id contains sign': !!altBtn2
    });
  }

  // Add event listener for furniture cart button
  const furnitureCartBtn = document.querySelector('#furniture-cart-btn');
  if (furnitureCartBtn) {
    console.log('Adding event listener to furniture cart button');
    furnitureCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🛒 Furniture cart button clicked!');
      if (typeof window.toggleCart === 'function') {
        window.toggleCart();
      } else {
        console.error('toggleCart function not available');
      }
    });
  } else {
    console.error('Furniture cart button not found');
  }

  // Add event listener for cafe cart button
  const cafeCartBtn = document.querySelector('#cafe-cart-btn');
  if (cafeCartBtn) {
    console.log('Adding event listener to cafe cart button');
    cafeCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('☕ Cafe cart button clicked!');
      if (typeof window.toggleCafeCart === 'function') {
        window.toggleCafeCart();
      } else {
        console.error('toggleCafeCart function not available');
        // Create the function if it doesn't exist
        window.toggleCafeCart = function() {
          console.log('Creating toggleCafeCart function');
          const cafeCartSidebar = document.querySelector('#cafe-cart-sidebar');
          const cafeCartOverlay = document.querySelector('#cafe-cart-overlay');
          
          if (cafeCartSidebar && cafeCartOverlay) {
            const isOpen = cafeCartSidebar.classList.contains('open');
            if (isOpen) {
              cafeCartSidebar.classList.remove('open');
              cafeCartOverlay.classList.remove('open');
              document.body.style.overflow = 'auto';
            } else {
              cafeCartSidebar.classList.add('open');
              cafeCartOverlay.classList.add('open');
              document.body.style.overflow = 'hidden';
            }
          } else {
            console.error('Cafe cart elements not found');
          }
        };
        window.toggleCafeCart();
      }
    });
  } else {
    console.error('Cafe cart button not found');
  }

  // Add event listeners for close buttons
  const closeCartBtn = document.querySelector('#close-cart-btn');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Close cart button clicked');
      if (typeof window.toggleCart === 'function') {
        window.toggleCart();
      }
    });
  }

  const closeCafeCartBtn = document.querySelector('#close-cafe-cart-btn');
  if (closeCafeCartBtn) {
    closeCafeCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Close cafe cart button clicked');
      if (typeof window.toggleCafeCart === 'function') {
        window.toggleCafeCart();
      }
    });
  }

  // Add event listeners for overlays
  const cartOverlay = document.querySelector('#cart-overlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', function(e) {
      console.log('Cart overlay clicked');
      if (typeof window.toggleCart === 'function') {
        window.toggleCart();
      }
    });
  }

  const cafeCartOverlay = document.querySelector('#cafe-cart-overlay');
  if (cafeCartOverlay) {
    cafeCartOverlay.addEventListener('click', function(e) {
      console.log('Cafe cart overlay clicked');
      if (typeof window.toggleCafeCart === 'function') {
        window.toggleCafeCart();
      }
    });
  }

  // Add event listener for cafe checkout button
  const cafeCheckoutBtn = document.querySelector('#cafe-checkout-btn');
  if (cafeCheckoutBtn) {
    cafeCheckoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Cafe checkout button clicked');
      if (typeof window.proceedToCafeCheckout === 'function') {
        window.proceedToCafeCheckout();
      }
    });
  }

  // Add event listener for auth modal close button
  const closeAuthModalBtn = document.querySelector('#close-auth-modal');
  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Close auth modal button clicked');
      if (typeof window.closeAuthModal === 'function') {
        window.closeAuthModal();
      }
    });
  }
  
  // Initialize cart display
  try {
    updateCartDisplay();
  } catch (error) {
    console.error('Error initializing cart display:', error);
  }
  
  // Initialize other features
  try {
    addScrollEffects();
    addNewsletterHandler();
    addMobileMenuHandler();
    addContactFormHandler();
    addIntersectionObserver();
    addSmoothScrolling();
  } catch (error) {
    console.error('Error initializing features:', error);
  }
  
  console.log('Initialization complete')
  
  // Test cart functionality
  setTimeout(() => {
    console.log('Testing cart functionality...')
    console.log('Cart elements:', {
      cartSidebar: cartSidebar,
      cartOverlay: cartOverlay,
      cartItems: cartItems,
      cartTotal: cartTotal,
      cartCount: cartCount
    })
    console.log('Products:', products)
    console.log('Cart:', cart)
  }, 1000)

  // Auth modal logic - initialize global variables
  const signInLink = document.querySelector('a[href="signin.html"]');
  authModal = document.getElementById('auth-modal');
  authForm = document.getElementById('auth-form');
  authError = document.getElementById('auth-error-message');
  authModalTitle = document.getElementById('auth-modal-title');
  submitText = document.getElementById('submit-text');
  toggleText = document.getElementById('toggle-text');
  toggleLink = document.getElementById('toggle-link');
  nameGroup = document.getElementById('name-group');
  confirmPasswordGroup = document.getElementById('confirm-password-group');
  confirmPassword = document.getElementById('confirm-password');

  if (signInLink) {
    signInLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  }

  // Auth modal functions are now defined globally above - removed duplicates

  function setAuthMode(signUp) {
    isSignUp = signUp;
    if (authModalTitle) authModalTitle.textContent = signUp ? 'Sign Up' : 'Sign In';
    if (submitText) submitText.textContent = signUp ? 'Sign Up' : 'Sign In';
    if (toggleText) toggleText.textContent = signUp ? 'Already have an account?' : "Don't have an account?";
    if (toggleLink) toggleLink.textContent = signUp ? 'Sign In' : 'Sign Up';
    if (nameGroup) nameGroup.style.display = signUp ? 'block' : 'none';
    if (confirmPasswordGroup) confirmPasswordGroup.style.display = signUp ? 'block' : 'none';
    if (confirmPassword) confirmPassword.required = signUp;
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (authError) authError.style.display = 'none';
      const email = authForm.email.value.trim();
      const password = authForm.password.value;
      const displayName = authForm['display-name'] ? authForm['display-name'].value.trim() : '';
      const confirmPass = authForm['confirm-password'] ? authForm['confirm-password'].value : '';
      if (!email || !password || (isSignUp && !displayName)) {
        showAuthError('Please fill in all required fields.');
        return;
      }
      if (isSignUp && password !== confirmPass) {
        showAuthError('Passwords do not match.');
        return;
      }
      if (isSignUp && password.length < 6) {
        showAuthError('Password must be at least 6 characters long.');
        return;
      }
      try {
        if (isSignUp) {
          await signUpWithEmail(email, password, displayName);
        } else {
          await signInWithEmail(email, password);
        }
        closeAuthModal();
      } catch (error) {
        showAuthError(error.message || 'Authentication failed.');
      }
    });
  }

  function showAuthError(msg) {
    if (authError) {
      authError.textContent = msg;
      authError.style.display = 'block';
    }
  }
});

// Cart functionality
function toggleCart() {
  console.log('🛒 toggleCart called');
  
  // Check if cart is empty
  if (!cart || cart.length === 0) {
    showNotification('Your cart is empty! Browse our furniture collection to add items. 🛋️', 'info');
    // Redirect to shop page after a short delay
    setTimeout(() => {
      window.location.href = 'shop.html';
    }, 2000);
    return;
  }
  
  try {
    // Always try to find elements fresh
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    console.log('Cart elements found:', {
      sidebar: !!sidebar,
      overlay: !!overlay
    });
    
    if (!sidebar || !overlay) {
      console.error('Cart elements not found');
      return;
    }
    
    const isOpen = sidebar.classList.contains('open');
    console.log('Cart is currently open:', isOpen);
    
    if (isOpen) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      console.log('✅ Cart closed');
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('✅ Cart opened');
    }
  } catch (error) {
    console.error('Error in toggleCart:', error);
  }
}

async function addToCart(productId) {
  console.log('Adding to cart, productId:', productId);
  
  try {
    const product = products[productId];
    console.log('Product found:', product);
    
    if (!product) {
      console.error('Product not found:', productId)
      showNotification('Product not found. Please try again.', 'error')
      return
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    updateCartDisplay();
    saveCartToLocalStorage(); // Keep localStorage as backup
    await saveCartToFirestore(); // Save to Firestore for authenticated users
    showNotification(`${product.name} added to cart!`, 'success');
  } catch (error) {
    console.error('Error adding to cart:', error)
    showNotification('Something went wrong. Please try again.', 'error')
  }
}

function removeFromCart(productId) {
  // Handle both numeric and string IDs (for café items)
  const itemToRemove = cart.find((item) => item.id == productId)
  cart = cart.filter((item) => item.id != productId) // Use != to handle both string and number comparison
  
  updateCartDisplay()
  saveCartToLocalStorage()
  saveCartToFirestore()
  
  if (itemToRemove) {
    showNotification(`${itemToRemove.name} removed from cart`, "info")
    console.log('Removed item from cart:', itemToRemove.name)
  } else {
    showNotification("Item removed from cart", "info")
  }
}

function updateQuantity(productId, change) {
  // Handle both numeric and string IDs (for café items)
  const item = cart.find((item) => item.id == productId) // Use == to handle both string and number comparison
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    } else {
      updateCartDisplay()
      saveCartToLocalStorage()
      saveCartToFirestore()
    }
    console.log('Updated quantity for item:', item.name, 'New quantity:', item.quantity)
  } else {
    console.error('Item not found in cart:', productId)
  }
}

// Duplicate saveCartToFirestore function removed - using the one defined earlier

function updateCartDisplay() {
  console.log('Updating cart display, cart:', cart);
  
  try {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    console.log('Total items:', totalItems, 'Total price:', totalPrice);

    if (cartCount) {
      cartCount.textContent = totalItems;
      console.log('Updated cart count');
    } else {
      console.warn('cartCount element not found');
    }
    
    if (cartTotal) {
      cartTotal.textContent = totalPrice.toFixed(0);
      console.log('Updated cart total');
    } else {
      console.warn('cartTotal element not found');
    }

    if (cart.length === 0) {
      if (cartItems) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty<br>🛒<br>Start shopping to add items!</p>';
        console.log('Cart is empty, showing empty message');
      } else {
        console.warn('cartItems element not found');
      }
    } else {
      if (cartItems) {
        const cartHTML = cart
          .map(
            (item) => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='${item.category === 'cafe' ? 'artisan coffee.webp' : 'image1.jpeg'}'">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
              </div>
              ${item.category === 'cafe' ? '<div class="cart-item-badge">☕ Café Item</div>' : ''}
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">✕</button>
          </div>
        `,
          )
          .join("");
        
        cartItems.innerHTML = cartHTML;
        console.log('Updated cart items HTML');
      } else {
        console.warn('cartItems element not found');
      }
    }
  } catch (error) {
    console.error('Error updating cart display:', error);
    console.error('Error stack:', error.stack);
    showNotification('Error updating cart. Please refresh the page.', 'error');
  }
}

function showAddToCartAnimation() {
  const cartButton = document.querySelector(".cart-btn")
  cartButton.style.transform = "scale(1.2)"
  cartButton.style.background = "rgba(16, 185, 129, 0.2)"
  setTimeout(() => {
    cartButton.style.transform = "scale(1)"
    cartButton.style.background = ""
  }, 300)
}

// Favorites functionality
function toggleFavorite(productId) {
  try {
    const favoriteBtn = document.querySelector(`[onclick="toggleFavorite(${productId})"]`)
    const product = products[productId]
    
    if (!product) {
      console.error('Product not found:', productId)
      showNotification('Product not found. Please try again.', 'error')
      return
    }

    if (favorites.includes(productId)) {
      favorites = favorites.filter((id) => id !== productId)
      if (favoriteBtn) {
        favoriteBtn.innerHTML = "♡"
        favoriteBtn.classList.remove("active")
      }
      showNotification(`${product.name} removed from favorites`, "info")
    } else {
      favorites.push(productId)
      if (favoriteBtn) {
        favoriteBtn.innerHTML = "❤️"
        favoriteBtn.classList.add("active")
      }
      showNotification(`${product.name} added to favorites!`, "success")
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    showNotification('Something went wrong. Please try again.', 'error')
  }
}

// Notification system
function showNotification(message, type = "info") {
  console.log('Showing notification:', message, 'type:', type)
  
  try {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

  // Add notification styles if not already added
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style")
    styles.id = "notification-styles"
    styles.textContent = `
      .notification {
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        border-left: 4px solid #10b981;
      }
      .notification.success { border-left-color: #10b981; }
      .notification.info { border-left-color: #3b82f6; }
      .notification.error { border-left-color: #ef4444; }
      .notification-content {
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .notification-content button {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `
    document.head.appendChild(styles)
  }

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)"
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 300)
  }, 3000)
  } catch (error) {
    console.error('Error showing notification:', error)
    // Fallback to alert if notification system fails
    alert(message)
  }
}

// Scroll effects and navigation
function addScrollEffects() {
  const navbar = document.querySelector(".navbar")
  const sections = document.querySelectorAll("section")
  const navLinks = document.querySelectorAll(".nav-menu a")

  window.addEventListener("scroll", () => {
    // Enhanced navbar background change
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)"
      navbar.style.backdropFilter = "blur(20px)"
      navbar.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.15)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.9)"
      navbar.style.backdropFilter = "blur(20px)"
      navbar.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.1)"
    }

    // Active section highlighting
    let current = ""
    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.clientHeight
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active")
      }
    })
  })
}

// Smooth scrolling for navigation
function addSmoothScrolling() {
  const navLinks = document.querySelectorAll(".nav-menu a, .cta-button")

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href")
      if (href && href.startsWith("#")) {
        e.preventDefault()
        const targetSection = document.querySelector(href)
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Close mobile menu if open
          const navMenu = document.querySelector(".nav-menu")
          const hamburger = document.querySelector(".hamburger")
          if (navMenu && hamburger) {
            navMenu.classList.remove("active")
            hamburger.classList.remove("active")
          }
        }
      }
    })
  })
}

// Newsletter signup
function addNewsletterHandler() {
  const newsletterForm = document.getElementById("newsletterForm")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = e.target.querySelector('input[type="email"]').value

      // Simulate newsletter signup
      showNotification(`Thank you for subscribing! Welcome to Wood & Whimsy, ${email.split("@")[0]}! 🎉`, "success")
      e.target.reset()
    })
  }
}

// Contact form handler
function addContactFormHandler() {
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        subject: e.target.subject.value,
        message: e.target.message.value,
      }

      // Simulate form submission
      showNotification(
        `Thank you ${formData.name}! Your message has been sent. We'll get back to you within 24 hours. 📧`,
        "success",
      )
      e.target.reset()
    })
  }
}

// Mobile menu handler
function addMobileMenuHandler() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", toggleMobileMenu)
  }
}

function toggleMobileMenu() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")

  // Add mobile menu styles if not already added
  if (!document.querySelector("#mobile-menu-styles")) {
    const styles = document.createElement("style")
    styles.id = "mobile-menu-styles"
    styles.textContent = `
      @media (max-width: 768px) {
        .nav-menu.active {
          display: flex;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
          padding: 1rem 0;
          border-top: 1px solid rgba(16, 185, 129, 0.1);
        }
        .nav-menu.active li {
          margin: 0;
        }
        .nav-menu.active a {
          padding: 1rem 2rem;
          display: block;
          border-bottom: 1px solid rgba(16, 185, 129, 0.05);
        }
        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
      }
    `
    document.head.appendChild(styles)
  }
}

// Intersection Observer for animations
function addIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".category-card, .product-card, .menu-item, .feature, .contact-card, .cafe-info-card",
  )
  animateElements.forEach((el) => {
    observer.observe(el)
  })
}

// Category card click handlers
document.addEventListener("DOMContentLoaded", () => {
  const categoryCards = document.querySelectorAll(".category-card")
  console.log('Found category cards:', categoryCards.length);
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      console.log('Category card clicked');
      // Scroll to products section
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({
          behavior: "smooth",
        });
      }
      showNotification("Showing products for this category! 🛋️", "info")
    })
  })
})

// Menu item order handlers
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("order-btn")) {
    const menuItem = e.target.closest(".menu-item")
    const itemName = menuItem.querySelector("h3").textContent
    showNotification(`${itemName} added to your café order! ☕`, "success")
  }
})

// Search functionality - wrapped in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const searchTerm = prompt("What are you looking for? 🔍")
      if (searchTerm) {
        showNotification(`Searching for "${searchTerm}"... 🔍`, "info")
        // Here you would implement actual search functionality
      }
    });
  }
});

// CTA button handlers
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cta-button")) {
    if (e.target.textContent.includes("Shop")) {
      document.getElementById("products").scrollIntoView({
        behavior: "smooth",
      })
    } else if (e.target.textContent.includes("Café")) {
      document.getElementById("cafe").scrollIntoView({
        behavior: "smooth",
      })
    }
  }
})

// Checkout handler
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("checkout-btn")) {
    if (cart.length === 0) {
      showNotification("Your cart is empty! Add some items first. 🛒", "info")
      return
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    showNotification(`Proceeding to checkout with total: $${total} 💳`, "success")
    // Here you would implement actual checkout functionality
  }
})

// Get directions function
function getDirections() {
  showNotification("Opening directions to Wood & Whimsy... 🗺️", "info")
  // In a real application, this would open Google Maps or similar
  setTimeout(() => {
    alert(
      "Directions to Wood & Whimsy Showroom:\n\n📍 Nsawam Dobro 142\nAkuapim District\nEastern Region\n\n🚗 Estimated drive time: 15-30 minutes from most locations",
    )
  }, 1000)
}

// Enhanced scroll-to-top functionality
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      if (!document.querySelector(".scroll-to-top")) {
      const scrollBtn = document.createElement("button")
      scrollBtn.className = "scroll-to-top"
      scrollBtn.innerHTML = "↑"
      scrollBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }

      // Add scroll-to-top styles
      const styles = document.createElement("style")
      styles.textContent = `
        .scroll-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .scroll-to-top:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        }
      `
      document.head.appendChild(styles)
        document.body.appendChild(scrollBtn)
      }
    } else {
      const scrollBtn = document.querySelector(".scroll-to-top")
      if (scrollBtn) {
        scrollBtn.remove()
      }
    }
  });
});

// Add loading states for better UX
function addLoadingState(element, text = "Loading...") {
  if (!element) return;
  element.innerHTML = `<span class="loading-spinner"></span> ${text}`
  element.disabled = true

  // Remove loading state after 2 seconds (or when your actual operation completes)
  setTimeout(() => {
    element.innerHTML = element.innerHTML.replace(
      /<span class="loading-spinner"><\/span> /,
      "",
    )
    element.disabled = false
  }, 2000)
}

// Enhanced error handling
window.addEventListener("error", (e) => {
  console.error("An error occurred:", e.error)
  showNotification("Something went wrong. Please try again.", "error")
})

// Add keyboard navigation support
document.addEventListener("keydown", (e) => {
  // Close cart with Escape key
  if (e.key === "Escape" && cartSidebar.classList.contains("open")) {
    toggleCart()
  }

  // Quick search with Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault()
    document.querySelector(".search-btn").click()
  }
})

console.log("🌿 Wood & Whimsy website loaded successfully! Welcome to our friendly furniture and café experience! ☕🛋️")

// Test function for debugging
function testCart() {
  console.log('=== CART TEST ===')
  console.log('Cart elements:', {
    cartSidebar: cartSidebar,
    cartOverlay: cartOverlay,
    cartItems: cartItems,
    cartTotal: cartTotal,
    cartCount: cartCount
  })
  console.log('Products:', products)
  console.log('Cart:', cart)
  
  try {
    addToCart(1)
    console.log('Add to cart test completed')
  } catch (error) {
    console.error('Add to cart test failed:', error)
  }
}

// Comprehensive initialization function
function initializeApp() {
  console.log('Initializing Wood & Whimsy app...');
  
  // Load cart from localStorage as backup
  loadCartFromLocalStorage();
  
  // Initialize all event handlers
  addScrollEffects();
  addSmoothScrolling();
  addNewsletterHandler();
  addContactFormHandler();
  addMobileMenuHandler();
  addIntersectionObserver();
  
  // Initialize cart display
  updateCartDisplay();
  
  console.log('App initialization complete!');
}

// Function to synchronize cart with module variable
function syncCartWithModule(newCart) {
  cart = newCart;
  window.cart = cart;
  console.log('Cart synchronized:', cart);
}

// Function to add café items to the main cart
function addCafeItemToCart(cafeItem) {
  console.log('Adding café item to cart:', cafeItem);
  
  try {
    const existingItem = cart.find(item => item.name === cafeItem.name && item.category === 'cafe');
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push(cafeItem);
    }

    // Synchronize with window.cart
    window.cart = cart;
    
    console.log('Cart after adding item:', cart);
    console.log('Window.cart after adding item:', window.cart);

    updateCartDisplay();
    saveCartToLocalStorage();
    saveCartToFirestore();
    showNotification(`${cafeItem.name} added to cart!`, 'success');
    
    console.log('Café item added successfully:', cafeItem.name);
  } catch (error) {
    console.error('Error adding café item to cart:', error);
    showNotification('Something went wrong. Please try again.', 'error');
  }
}

// Function to save cart to localStorage (backup)
function saveCartToLocalStorage() {
  try {
    localStorage.setItem('woodWhimsyCart', JSON.stringify(cart));
    console.log('Cart saved to localStorage');
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

// Function to load cart from localStorage (backup)
function loadCartFromLocalStorage() {
  try {
    const savedCart = localStorage.getItem('woodWhimsyCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartDisplay();
      console.log('Cart loaded from localStorage');
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
}

// Add event listeners for add-to-cart buttons
function initializeAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = parseInt(this.getAttribute('onclick').match(/\d+/)[0]);
      addToCart(productId);
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeAddToCartButtons);

// Initialize after a delay (fallback)
setTimeout(initializeAddToCartButtons, 1000);

// Initialize on window load (another fallback)
window.addEventListener('load', initializeAddToCartButtons);

// Global function to reinitialize if needed
window.reinitializeCartButtons = initializeAddToCartButtons;

// Make functions and variables globally available immediately
window.testCart = testCart;
window.addToCart = addToCart;
window.addCafeItemToCart = addCafeItemToCart;
window.syncCartWithModule = syncCartWithModule;
window.toggleCart = toggleCart;
window.toggleCafeCart = window.toggleCafeCart || function() {
  console.log('Creating toggleCafeCart function');
  const cafeCartSidebar = document.querySelector('#cafe-cart-sidebar');
  const cafeCartOverlay = document.querySelector('#cafe-cart-overlay');
  
  if (cafeCartSidebar && cafeCartOverlay) {
    const isOpen = cafeCartSidebar.classList.contains('open');
    if (isOpen) {
      cafeCartSidebar.classList.remove('open');
      cafeCartOverlay.classList.remove('open');
      document.body.style.overflow = 'auto';
      console.log('✅ Cafe cart closed');
    } else {
      cafeCartSidebar.classList.add('open');
      cafeCartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      console.log('✅ Cafe cart opened');
    }
  } else {
    console.error('Cafe cart elements not found');
  }
};
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.toggleCafeCart = toggleCafeCart;
window.proceedToCafeCheckout = proceedToCafeCheckout;
window.toggleFavorite = toggleFavorite;
window.getDirections = getDirections;
window.signOutUser = signOutUser;
window.proceedToCheckout = proceedToCheckout;
window.toggleMobileMenu = toggleMobileMenu;
window.initializeApp = initializeApp;
window.saveCartToLocalStorage = saveCartToLocalStorage;
window.loadCartFromLocalStorage = loadCartFromLocalStorage;
window.updateCartDisplay = updateCartDisplay;
window.showNotification = showNotification;

// Make cart globally accessible
window.cart = cart;

// Define auth functions globally to ensure they work with onclick handlers
window.openAuthModal = function() {
  console.log('🔥 openAuthModal called - button clicked!');
  const authModal = document.getElementById('auth-modal');
  console.log('Auth modal element:', authModal);
  
  if (authModal) {
    console.log('Modal found, forcing display...');
    
    // Remove any existing classes first
    authModal.classList.remove('active');
    
    // Force display immediately with inline styles
    authModal.style.cssText = `
      display: flex !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(31,41,55,0.45) !important;
      z-index: 9999 !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;
    
    // Then add active class
    authModal.classList.add('active');
    
    console.log('Modal should now be visible');
    console.log('Modal computed display:', window.getComputedStyle(authModal).display);
    console.log('Modal computed visibility:', window.getComputedStyle(authModal).visibility);
    
    // Initialize auth mode if needed
    const authModalTitle = document.getElementById('auth-modal-title');
    if (authModalTitle) authModalTitle.textContent = 'Sign In';
    
    // Reset to sign in mode
    if (typeof isSignUp !== 'undefined') {
      isSignUp = false;
    }
    const nameGroup = document.getElementById('name-group');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    if (nameGroup) nameGroup.style.display = 'none';
    if (confirmPasswordGroup) confirmPasswordGroup.style.display = 'none';
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Auth modal setup complete');
  } else {
    console.error('❌ Auth modal element not found');
    alert('Sign in modal not found. Please refresh the page.');
  }
};

window.closeAuthModal = function() {
  console.log('closeAuthModal called');
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.classList.remove('active');
    authModal.style.display = 'none';
    authModal.style.visibility = 'hidden';
    authModal.style.opacity = '0';
    document.body.style.overflow = 'auto';
    console.log('Auth modal hidden');
  }
};

window.toggleAuthMode = function() {
  console.log('Toggle auth mode clicked');
  isSignUp = !isSignUp;
  
  const authModalTitle = document.getElementById('auth-modal-title');
  const submitText = document.getElementById('submit-text');
  const toggleText = document.getElementById('toggle-text');
  const toggleLink = document.getElementById('toggle-link');
  const nameGroup = document.getElementById('name-group');
  const confirmPasswordGroup = document.getElementById('confirm-password-group');
  const confirmPassword = document.getElementById('confirm-password');
  const authSubtitle = document.getElementById('auth-subtitle');
  
  if (isSignUp) {
    if (authModalTitle) authModalTitle.textContent = 'Sign Up';
    if (authSubtitle) authSubtitle.textContent = 'Create your account to get started';
    if (submitText) submitText.textContent = 'Sign Up';
    if (toggleText) toggleText.textContent = 'Already have an account?';
    if (toggleLink) toggleLink.textContent = 'Sign In';
    if (nameGroup) nameGroup.style.display = 'block';
    if (confirmPasswordGroup) confirmPasswordGroup.style.display = 'block';
    if (confirmPassword) confirmPassword.required = true;
  } else {
    if (authModalTitle) authModalTitle.textContent = 'Sign In';
    if (authSubtitle) authSubtitle.textContent = 'Welcome back! Sign in to your account';
    if (submitText) submitText.textContent = 'Sign In';
    if (toggleText) toggleText.textContent = "Don't have an account?";
    if (toggleLink) toggleLink.textContent = 'Sign Up';
    if (nameGroup) nameGroup.style.display = 'none';
    if (confirmPasswordGroup) confirmPasswordGroup.style.display = 'none';
    if (confirmPassword) confirmPassword.required = false;
  }
  
  // Clear any error messages
  const authError = document.getElementById('error-message');
  if (authError) authError.style.display = 'none';
};

// Email authentication functions
async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showNotification('Successfully signed in!', 'success');
    console.log('User signed in:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

async function signUpWithEmail(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    showNotification('Account created successfully!', 'success');
    console.log('User signed up:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

function showAuthError(message) {
  const authError = document.getElementById('error-message');
  if (authError) {
    authError.textContent = message;
    authError.style.display = 'block';
  }
}

// Social sign-in functions
if (!window.signInWithGoogle) {
  window.signInWithGoogle = async function() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showNotification('Successfully signed in with Google!', 'success');
      closeAuthModal();
    } catch (error) {
      console.error('Google sign-in error:', error);
      showAuthError('Failed to sign in with Google. Please try again.');
    }
  };
}

function signInWithApple() {
  console.log('Apple sign in clicked');
  showNotification('Apple sign-in coming soon!', 'info');
}

function signInWithFacebook() {
  console.log('Facebook sign in clicked');
  showNotification('Facebook sign-in coming soon!', 'info');
}

// Missing functions for onclick handlers
function scrollToHome() {
  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
}

function shopCollection() {
  window.location.href = 'shop.html';
}

function visitCafe() {
  window.location.href = 'cafe.html';
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = input?.nextElementSibling;
  if (input && button) {
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
    } else {
      input.type = 'password';
      button.textContent = '👀';
    }
  }
}

function signInWithGoogle() {
  if (typeof window.signInWithGoogleProvider === 'function') {
    window.signInWithGoogleProvider();
  } else {
    showNotification('Google sign-in coming soon!', 'info');
  }
}

function toggleAuthMode() {
  if (typeof window.toggleSignUpMode === 'function') {
    window.toggleSignUpMode();
  } else {
    console.log('Toggle auth mode clicked');
  }
}

function showForgotPassword() {
  showNotification('Password reset coming soon!', 'info');
}

// Make functions globally available
window.signInWithApple = signInWithApple;
window.signInWithFacebook = signInWithFacebook;

// reCAPTCHA callback functions
window.onRecaptchaSuccess = function() {
  console.log('reCAPTCHA verified');
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
  }
};

window.onRecaptchaExpired = function() {
  console.log('reCAPTCHA expired');
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
  }
};

// Password visibility toggle
window.togglePasswordVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👀';
  }
};

// Forgot password function
window.showForgotPassword = function() {
  showNotification('Password reset functionality coming soon!', 'info');
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Add a simple test to verify the script is loading
console.log('🚀 Script.js loaded successfully');

// Test function to verify openAuthModal is available
window.testSignIn = function() {
  console.log('Testing sign in button...');
  if (typeof window.openAuthModal === 'function') {
    console.log('✅ openAuthModal function exists');
    window.openAuthModal();
  } else {
    console.error('❌ openAuthModal function not found');
  }
};

// Force modal to work - add immediate test when page loads
setTimeout(() => {
  console.log('=== TESTING MODAL AVAILABILITY ===');
  const modal = document.getElementById('auth-modal');
  console.log('Modal element found:', !!modal);
  
  const signInBtn = document.getElementById('sign-in-link');
  console.log('Sign in button found:', !!signInBtn);
  
  if (modal) {
    console.log('Modal classes:', modal.className);
    console.log('Modal display style:', window.getComputedStyle(modal).display);
    console.log('Modal visibility:', window.getComputedStyle(modal).visibility);
  }
  
  // Test the function directly
  console.log('Testing openAuthModal function...');
  if (typeof window.openAuthModal === 'function') {
    console.log('✅ openAuthModal function exists');
  } else {
    console.error('❌ openAuthModal function missing');
  }
  
  // Add a global test function
  window.testModal = function() {
    console.log('=== MANUAL MODAL TEST ===');
    if (typeof window.openAuthModal === 'function') {
      window.openAuthModal();
    } else {
      console.error('openAuthModal not available');
    }
  };
  
  console.log('=== Run window.testModal() in console to test manually ===');
}, 2000);
