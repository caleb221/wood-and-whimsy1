# 🪵 Wood & Whimsy - Premium Furniture & Café

A complete, modern e-commerce website featuring premium furniture, authentic Ghanaian café, and comprehensive contact management system with Firebase integration.

## 🚀 Quick Start

### Option 1: Node.js Server (Recommended)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Python Server
```bash
# Start Python server
npm run serve
```

### Option 3: Firebase Local Server
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start Firebase local server
npm run firebase:serve
```

## 🌐 Access URLs

- **Homepage**: http://localhost:3001
- **Sign-in Page**: http://localhost:3001/signin.html
- **Firebase Project**: wood12-f40fe

## 🔐 Authentication Features

### ✅ Implemented
- **Google Sign-in** - One-click authentication
- **Email/Password** - Traditional sign-up and sign-in
- **Real-time User State** - Shows user profile when logged in
- **Session Persistence** - Stays logged in across page refreshes
- **Responsive Design** - Works on all devices

### 🔄 User Flow
1. **New Users**: Click "Sign In" → "Sign Up" → Fill form → Create account
2. **Existing Users**: Click "Sign In" → Use Google or email/password
3. **User Profile**: Once logged in, see name and avatar in navigation
4. **Logout**: Click logout button in user profile

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Server**: Express.js (development)
- **Styling**: Custom CSS with modern design

## 📁 Project Structure

```
├── index.html          # Main homepage
├── signin.html         # Authentication page
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript (with Firebase)
├── auth.js             # Authentication logic
├── server.js           # Development server
├── firebase.json       # Firebase configuration
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Configuration

### Firebase Setup
- **Project ID**: wood12-f40fe
- **Authentication**: Enabled for Google and Email/Password
- **Hosting**: Configured for static file serving

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 🚀 Deployment

### Firebase Deployment
```bash
# Deploy to Firebase Hosting
npm run firebase:deploy
```

### Custom Server Deployment
```bash
# Set environment variables
export PORT=8080
export NODE_ENV=production

# Start production server
npm start
```

## 🎨 Features

### Homepage
- ✅ Hero section with call-to-action
- ✅ Furniture categories
- ✅ Café menu showcase
- ✅ Featured products
- ✅ About section
- ✅ Contact information
- ✅ Newsletter signup

### Authentication
- ✅ Google Sign-in
- ✅ Email/Password authentication
- ✅ User profile display
- ✅ Session management
- ✅ Error handling
- ✅ Loading states

### Shopping Features
- ✅ Shopping cart
- ✅ Product favorites
- ✅ Add to cart animations
- ✅ Cart sidebar
- ✅ Product ratings

## 🔒 Security

- ✅ Firebase Authentication
- ✅ Secure password handling
- ✅ HTTPS enforcement (in production)
- ✅ Input validation
- ✅ Error sanitization

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop enhancement
- ✅ Touch-friendly interactions

## 🎯 Performance

- ✅ Optimized images
- ✅ Minified CSS/JS
- ✅ Lazy loading
- ✅ Fast loading times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for furniture lovers and coffee enthusiasts!** 