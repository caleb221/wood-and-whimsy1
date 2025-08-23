// Account Management JavaScript

// Global user variable
let currentUser = null;

// Check if user is authenticated on page load
window.addEventListener('DOMContentLoaded', function() {
  checkUserAuthentication();
});

// Check if user is authenticated using Firebase
function checkUserAuthentication() {
  const auth = firebase.auth();
  
  // Listen for authentication state changes
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log('User is authenticated:', user);
      currentUser = user;
      updateUserDisplay(user);
      loadUserProfile();
      loadPaymentMethods();
      loadOrderHistory();
      loadUserPreferences();
      setupFormHandlers();
    } else {
      // User is not signed in
      console.log('No user authenticated');
      alert('Please sign in to access your account.');
      window.location.href = 'signin-new.html';
    }
  });
}

// Update user display in navigation
function updateUserDisplay(user) {
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');
  
  if (userName) userName.textContent = user.displayName || user.email;
  if (userAvatar) userAvatar.src = user.photoURL || 'https://via.placeholder.com/32x32?text=👤';
}

// Load user profile data
function loadUserProfile() {
  if (!currentUser) return;
  
  try {
    const savedProfile = localStorage.getItem('userProfile');
    const profileData = savedProfile ? JSON.parse(savedProfile) : {};
    
    // Populate form fields with Firebase user data
    document.getElementById('profile-name').value = currentUser.displayName || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = profileData.phone || '';
    document.getElementById('profile-address').value = profileData.address || '';
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Setup form handlers
function setupFormHandlers() {
  // Profile form handler
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }
  
  // Password form handler
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      changePassword();
    });
  }
  
  // Payment form handler
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addPaymentMethod();
    });
  }
  
  // Preference toggles
  setupPreferenceHandlers();
}

// Save profile information
async function saveProfile() {
  try {
    const profileData = {
      name: document.getElementById('profile-name').value,
      phone: document.getElementById('profile-phone').value,
      address: document.getElementById('profile-address').value,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Update Firebase user profile
    if (currentUser && currentUser.updateProfile) {
      await currentUser.updateProfile({
        displayName: profileData.name
      });
    }
    
    alert('Profile updated successfully!');
    updateUserDisplay(currentUser);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile. Please try again.');
  }
}

// Change password
async function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;
  
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match!');
    return;
  }
  
  if (newPassword.length < 8) {
    alert('Password must be at least 8 characters long!');
    return;
  }
  
  try {
    const { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      alert('Please sign in again to change your password.');
      return;
    }
    
    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    
    alert('Password updated successfully!');
    document.getElementById('password-form').reset();
    
  } catch (error) {
    console.error('Error changing password:', error);
    if (error.code === 'auth/wrong-password') {
      alert('Current password is incorrect.');
    } else if (error.code === 'auth/weak-password') {
      alert('New password is too weak. Please choose a stronger password.');
    } else {
      alert('Error changing password: ' + error.message);
    }
  }
}

// Load payment methods
function loadPaymentMethods() {
  const paymentMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
  const container = document.getElementById('payment-methods');
  
  if (paymentMethods.length === 0) {
    container.innerHTML = '<div class="no-payments">No payment methods added yet.</div>';
    return;
  }
  
  container.innerHTML = paymentMethods.map(method => `
    <div class="payment-method" data-id="${method.id}">
      <div class="payment-info">
        <div class="card-type">${getCardType(method.cardNumber)} •••• ${method.cardNumber.slice(-4)}</div>
        <div class="card-details">Expires ${method.expiryDate}</div>
      </div>
      <div class="payment-actions">
        <button class="edit-btn" onclick="editPaymentMethod('${method.id}')">Edit</button>
        <button class="delete-btn" onclick="deletePaymentMethod('${method.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Get card type from number
function getCardType(cardNumber) {
  const firstDigit = cardNumber.charAt(0);
  if (firstDigit === '4') return 'Visa';
  if (firstDigit === '5') return 'Mastercard';
  if (firstDigit === '3') return 'American Express';
  return 'Card';
}

// Add payment method
function addPaymentMethod() {
  const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
  const expiryDate = document.getElementById('expiry-date').value;
  const cvv = document.getElementById('cvv').value;
  const cardholderName = document.getElementById('cardholder-name').value;
  const billingAddress = document.getElementById('billing-address').value;
  
  // Basic validation
  if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
    alert('Please fill in all required fields.');
    return;
  }
  
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    alert('Please enter a valid card number.');
    return;
  }
  
  const paymentMethod = {
    id: Date.now().toString(),
    cardNumber: cardNumber,
    expiryDate: expiryDate,
    cardholderName: cardholderName,
    billingAddress: billingAddress,
    addedDate: new Date().toISOString()
  };
  
  // Save to localStorage (in real app, this would be encrypted and stored securely)
  const paymentMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
  paymentMethods.push(paymentMethod);
  localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  
  alert('Payment method added successfully!');
  closeAddPaymentModal();
  loadPaymentMethods();
}

// Delete payment method
function deletePaymentMethod(methodId) {
  if (confirm('Are you sure you want to delete this payment method?')) {
    let paymentMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
    paymentMethods = paymentMethods.filter(method => method.id !== methodId);
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    loadPaymentMethods();
    alert('Payment method deleted successfully!');
  }
}

// Load order history
function loadOrderHistory() {
  const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const container = document.getElementById('order-history');
  
  if (orders.length === 0) {
    container.innerHTML = '<div class="no-orders">No orders yet. <a href="index.html#products">Start shopping!</a></div>';
    return;
  }
  
  container.innerHTML = orders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <span class="order-number">Order #${order.id}</span>
        <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
      </div>
      <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
      <div class="order-total">$${order.total.toFixed(2)}</div>
    </div>
  `).join('');
}

// Load user preferences
function loadUserPreferences() {
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  
  document.getElementById('email-notifications').checked = preferences.emailNotifications !== false;
  document.getElementById('sms-notifications').checked = preferences.smsNotifications === true;
  document.getElementById('marketing-emails').checked = preferences.marketingEmails !== false;
}

// Setup preference handlers
function setupPreferenceHandlers() {
  const checkboxes = ['email-notifications', 'sms-notifications', 'marketing-emails'];
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', savePreferences);
    }
  });
}

// Save preferences
function savePreferences() {
  const preferences = {
    emailNotifications: document.getElementById('email-notifications').checked,
    smsNotifications: document.getElementById('sms-notifications').checked,
    marketingEmails: document.getElementById('marketing-emails').checked,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
  console.log('Preferences saved:', preferences);
}

// Modal functions
window.openAddPaymentModal = function() {
  document.getElementById('payment-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeAddPaymentModal = function() {
  document.getElementById('payment-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
  document.getElementById('payment-form').reset();
};

// Delete account function
window.deleteAccount = async function() {
  const confirmation = prompt('Type "DELETE" to confirm account deletion:');
  if (confirmation !== 'DELETE') {
    alert('Account deletion cancelled.');
    return;
  }
  
  try {
    const { getAuth, deleteUser } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      await deleteUser(user);
    }
    
    // Clear all local data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('paymentMethods');
    localStorage.removeItem('orderHistory');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('cart');
    
    alert('Account deleted successfully.');
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Error deleting account: ' + error.message);
  }
};

// Sign out function
window.signOutUser = async function() {
  try {
    const auth = firebase.auth();
    
    await auth.signOut();
    
    alert('You have been signed out successfully.');
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Sign out error:', error);
    alert('Error signing out. Please try again.');
  }
};

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
      e.target.value = formattedValue;
    });
  }
  
  // Format expiry date input
  const expiryInput = document.getElementById('expiry-date');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
  
  // CVV input - numbers only
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
});

console.log('Account management script loaded');
