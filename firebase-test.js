// Firebase Test Script to diagnose auth/internal-error
console.log('🔥 Firebase Test Script Starting...');

// Test Firebase configuration
const testFirebaseConfig = {
  apiKey: "AIzaSyAVTV34a0jw5ScKywj-YXy5bt9FG01JBn0",
  authDomain: "wood12-f40fe.firebaseapp.com",
  projectId: "wood12-f40fe",
  storageBucket: "wood12-f40fe.firebasestorage.app",
  messagingSenderId: "522201725736",
  appId: "1:522201725736:web:78d597f9d5da25c1dbee1d"
};

// Alternative Google Sign-In using redirect instead of popup
async function testGoogleSignInRedirect() {
  try {
    console.log('Testing Google Sign-In with redirect...');
    
    if (!firebase.apps.length) {
      firebase.initializeApp(testFirebaseConfig);
    }
    
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Use redirect instead of popup to avoid internal errors
    await auth.signInWithRedirect(provider);
    
  } catch (error) {
    console.error('Redirect sign-in error:', error);
  }
}

// Handle redirect result
async function handleRedirectResult() {
  try {
    const auth = firebase.auth();
    const result = await auth.getRedirectResult();
    
    if (result.user) {
      console.log('✅ Redirect sign-in successful:', result.user);
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Redirect result error:', error);
  }
}

// Test basic Firebase connection
function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  console.log('Firebase available:', typeof firebase !== 'undefined');
  console.log('Firebase apps:', firebase.apps.length);
  console.log('Current domain:', window.location.hostname);
  console.log('Auth domain:', testFirebaseConfig.authDomain);
}

// Export functions for global use
window.testGoogleSignInRedirect = testGoogleSignInRedirect;
window.handleRedirectResult = handleRedirectResult;
window.testFirebaseConnection = testFirebaseConnection;

// Auto-run tests
document.addEventListener('DOMContentLoaded', () => {
  testFirebaseConnection();
  handleRedirectResult();
});
