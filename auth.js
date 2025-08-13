// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Test Firebase connection
console.log('Firebase app initialized:', app);
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
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed in auth.js:', user ? 'User signed in' : 'User signed out');
  // Note: Redirect is handled by individual sign-in functions, not here
  // This prevents infinite redirect loops on the main page
});

// Create or update user profile in Firestore
async function createUserProfile(user, additionalData = {}) {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        lastLoginAt: serverTimestamp(),
        ...additionalData
      });
      console.log('User profile created in Firestore');
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  } else {
    // Update last login time
    try {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
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
    const result = await signInWithPopup(auth, googleProvider);
    
    // Create user profile in Firestore
    await createUserProfile(result.user);
    
    showSuccess(`Welcome back, ${result.user.displayName}!`);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    console.error('Google sign-in error:', error);
    showError('Google sign-in failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Email/Password Sign In
async function signInWithEmail(email, password) {
  try {
    setLoading(true);
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Update user profile in Firestore
    await createUserProfile(result.user);
    
    showSuccess(`Welcome back, ${result.user.email}!`);
    setTimeout(() => {
      window.location.href = 'index.html';
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
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    // Create user profile in Firestore
    await createUserProfile(result.user, { signUpMethod: 'email' });
    
    showSuccess(`Welcome to Wood & Whimsy, ${displayName}!`);
    setTimeout(() => {
      window.location.href = 'index.html';
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

// Apple Sign In (placeholder - requires Apple Developer account)
function signInWithApple() {
  showError('Apple Sign In requires Apple Developer account setup. Please use Google or email sign-in for now.');
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