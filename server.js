const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3003;

// Serve static files
app.use(express.static('.'));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Wood & Whimsy server running on http://localhost:${PORT}`);
  console.log(`📱 Mobile access: http://192.168.43.37:${PORT}`);
  console.log(`🔥 Firebase project: wood12-f40fe`);
  console.log(`✨ Authentication system is ready!`);
  console.log(`📲 Use the mobile URL on your phone to access the site`);
});