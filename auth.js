// Firebase configuration and initialization using compat mode for better compatibility
const firebaseConfig = {
  apiKey: "AIzaSyAVTV34a0jw5ScKywj-YXy5bt9FG01JBn0",
  authDomain: "wood12-f40fe.firebaseapp.com",
  projectId: "wood12-f40fe",
  storageBucket: "wood12-f40fe.firebasestorage.app",
  messagingSenderId: "522201725736",
  appId: "1:522201725736:web:78d597f9d5da25c1dbee1d"
};

// Initialize Firebase using compat mode with error handling
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Configure Google provider globally with enhanced settings
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  'prompt': 'select_account',
  'access_type': 'offline'
});

// Test Firebase connection
console.log('Firebase auth initialized:', auth);
console.log('Current auth state:', auth.currentUser);

// Test Firebase connection
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
  if (user) {
    console.log('User details:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
  }
});

// Global variables
let isSignUp = false;
let isLoading = false;

// Authentication state observer (removed automatic redirect)
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed in auth.js:', user ? 'User signed in' : 'User signed out');
  // Note: Redirect is handled by individual sign-in functions, not here
  // This prevents infinite redirect loops on the main page
});

// Create or update user profile in Firestore
async function createUserProfile(user, additionalData = {}) {
  if (!user) return;
  
  const userRef = db.collection('users').doc(user.uid);
  const userSnap = await userRef.get();
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = firebase.firestore.FieldValue.serverTimestamp();
    
    try {
      await userRef.set({
        displayName,
        email,
        photoURL,
        createdAt,
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      });
      console.log('User profile created in Firestore');
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  } else {
    // Update last login time
    try {
      await userRef.update({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('User last login updated');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }
}

// Google Sign In
async function signInWithGoogle() {
  try {
    setLoading(true);
    
    // Verify Firebase is ready
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    console.log('Starting Google sign-in...');
    console.log('Auth domain:', firebaseConfig.authDomain);
    console.log('Current origin:', window.location.origin);
    
    const result = await auth.signInWithPopup(googleProvider);
    
    // Create user profile in Firestore
    await createUserProfile(result.user);
    
    showSuccess(`Welcome back, ${result.user.displayName}!`);
    setTimeout(() => {
      window.location.href = window.location.origin + '/index.html';
    }, 1500);
  } catch (error) {
    console.error('Google sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    if (error.code === 'auth/internal-error') {
      errorMessage = 'Firebase configuration error. Please check your project settings.';
      console.error('Internal error details - this usually indicates a Firebase project configuration issue');
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in popup was closed. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized for Google sign-in.';
    }
    
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Email/Password Sign In
async function signInWithEmail(email, password) {
  try {
    setLoading(true);
    const result = await auth.signInWithEmailAndPassword(email, password);
    
    // Update user profile in Firestore
    await createUserProfile(result.user);
    
    showSuccess(`Welcome back, ${result.user.email}!`);
    setTimeout(() => {
      window.location.href = window.location.origin + '/index.html';
    }, 1500);
  } catch (error) {
    console.error('Email sign-in error:', error);
    let errorMessage = 'Sign-in failed. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please sign up.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    }
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Email/Password Sign Up
async function signUpWithEmail(email, password, displayName) {
  try {
    setLoading(true);
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });
    
    // Create user profile in Firestore
    await createUserProfile(result.user, { signUpMethod: 'email' });
    
    showSuccess(`Welcome to Wood & Whimsy, ${displayName}!`);
    setTimeout(() => {
      window.location.href = window.location.origin + '/index.html';
    }, 1500);
  } catch (error) {
    console.error('Email sign-up error:', error);
    let errorMessage = 'Sign-up failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists. Please sign in.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters long.';
    }
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Apple Sign In
async function signInWithApple() {
  try {
    setLoading(true);
    
    // Check if Apple Sign-In is configured
    const appleProvider = new firebase.auth.OAuthProvider('apple.com');
    appleProvider.addScope('email');
    appleProvider.addScope('name');
    appleProvider.setCustomParameters({
      'locale': 'en'
    });
    
    console.log('Starting Apple sign-in...');
    const result = await auth.signInWithPopup(appleProvider);
    
    // Create user profile in Firestore
    await createUserProfile(result.user);
    
    showSuccess(`Welcome ${result.user.displayName || result.user.email}!`);
    setTimeout(() => {
      window.location.href = window.location.origin + '/index.html';
    }, 1500);
    
  } catch (error) {
    console.error('Apple sign-in error:', error);
    
    let errorMessage = 'Apple sign-in failed.';
    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Apple Sign-In is not configured. Please contact support.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in popup was closed. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else {
      errorMessage = `Apple sign-in failed: ${error.message}`;
    }
    
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Toggle between sign in and sign up
function toggleAuthMode() {
  isSignUp = !isSignUp;
  const submitText = document.getElementById('submit-text');
  const toggleText = document.getElementById('toggle-text');
  const toggleLink = document.getElementById('toggle-link');
  const subtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('name-group');
  const confirmPasswordGroup = document.getElementById('confirm-password-group');
  const confirmPassword = document.getElementById('confirm-password');

  // Clear messages
  hideMessages();

  if (isSignUp) {
    submitText.textContent = 'Create Account';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign In';
    subtitle.textContent = 'Create your account to get started';
    nameGroup.style.display = 'block';
    confirmPasswordGroup.style.display = 'block';
    confirmPassword.required = true;
  } else {
    submitText.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign Up';
    subtitle.textContent = 'Welcome back! Sign in to your account';
    nameGroup.style.display = 'none';
    confirmPasswordGroup.style.display = 'none';
    confirmPassword.required = false;
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  if (isLoading) return;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const displayName = document.getElementById('display-name').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value;

  // Validation
  if (!email || !password) {
    showError('Please fill in all required fields.');
    return;
  }

  if (isSignUp) {
    if (!displayName) {
      showError('Please enter your full name.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
  }

  if (isSignUp) {
    signUpWithEmail(email, password, displayName);
  } else {
    signInWithEmail(email, password);
  }
}

// Helper functions
function setLoading(loading) {
  isLoading = loading;
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  
  if (loading) {
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="loading"></span>Processing...';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = isSignUp ? 'Create Account' : 'Sign In';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  document.getElementById('success-message').style.display = 'none';
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  document.getElementById('error-message').style.display = 'none';
}

function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add form submit handler
  document.getElementById('auth-form').addEventListener('submit', handleFormSubmit);
  
  // Make functions globally available
  window.toggleAuthMode = toggleAuthMode;
  window.signInWithGoogle = signInWithGoogle;
  window.signInWithApple = signInWithApple;
}); 