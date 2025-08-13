# 🚚 Wood & Whimsy Order Tracking System

## Overview
The Wood & Whimsy Order Tracking System provides real-time order tracking with email notifications, allowing customers to monitor their furniture orders from processing to delivery.

## Features

### ✨ Real-Time Order Tracking
- **Visual Timeline**: Interactive timeline showing order progress
- **Status Updates**: Real-time status updates with detailed descriptions
- **Location Tracking**: Shows current location of the order
- **Estimated Delivery**: Dynamic delivery date calculations

### 📧 Email Notifications
- **Automated Emails**: Professional HTML emails sent at each status change
- **User Preferences**: Toggle email notifications on/off
- **Multiple Templates**: Different email templates for each order status
- **Delivery Reports**: Comprehensive tracking reports sent to customer email

### 🔒 Firebase Integration
- **Secure Storage**: Order data stored securely in Firebase Firestore
- **User Authentication**: Integration with existing auth system
- **Real-time Sync**: Automatic synchronization across devices

## Order Statuses

### 1. 📋 Processing
- Order received and being verified
- Payment processing
- Initial order validation

### 2. ✅ Confirmed
- Payment confirmed
- Order accepted for production
- Workshop notification sent

### 3. 🔨 In Production
- Furniture being crafted
- Quality control in progress
- Estimated completion tracking

### 4. 🔍 Quality Inspection
- Final quality checks
- Packaging preparation
- Shipping preparation

### 5. 🚚 Shipped
- Order dispatched from workshop
- In transit to customer
- Tracking number available

### 6. 🚛 Out for Delivery
- Local delivery in progress
- Delivery scheduled for today
- Customer notification sent

### 7. 🎉 Delivered
- Order successfully delivered
- Customer confirmation
- Feedback request sent

## Usage Instructions

### For Customers

#### Tracking an Order
1. Navigate to the tracking page: `http://localhost:3002/track.html`
2. Enter your order number (format: WW12345678)
3. Click "Track Order" to view status
4. Toggle email notifications if desired

#### Sample Order Numbers for Testing
- `WW12345678` - Currently shipped
- `WW87654321` - Currently in manufacturing

#### Email Notifications
- Click the email toggle to enable/disable notifications
- Receive updates at each status change
- Professional HTML emails with order details
- Plain text fallback for accessibility

### For Developers

#### File Structure
```
track.html          - Main tracking interface
track.js           - Tracking logic and Firebase integration
email-service.js   - Email notification service
checkout.js        - Updated with tracking integration
```

#### Key Functions

**track.js**
```javascript
trackOrder()              // Main tracking function
displayOrderDetails()     // Render order information
createTimeline()         // Generate visual timeline
sendTrackingEmail()      // Send email notifications
toggleEmailNotifications() // Manage notification preferences
```

**email-service.js**
```javascript
sendTrackingEmail()      // Send status-specific emails
generateTrackingReport() // Create email content
logEmailNotification()   // Store email records
```

**checkout.js**
```javascript
createInitialTimeline()  // Set up order tracking data
getEstimatedDelivery()   // Calculate delivery dates
getDeliveryAddress()     // Format delivery address
```

## Technical Implementation

### Firebase Collections

#### orders
```javascript
{
  orderId: "WW12345678",
  userId: "user_uid",
  orderDate: "2025-08-11",
  estimatedDelivery: "2025-08-18",
  deliveryAddress: "123 Main St, Accra, Ghana",
  currentStatus: "shipped",
  timeline: [...],
  items: [...],
  total: 2198
}
```

#### emailNotifications
```javascript
{
  to: "customer@example.com",
  subject: "Order Update: WW12345678",
  orderId: "WW12345678",
  status: "shipped",
  sentAt: timestamp,
  userId: "user_uid",
  delivered: true
}
```

### Email Templates
Professional HTML email templates for each status:
- Responsive design
- Brand consistency
- Clear call-to-action buttons
- Order details summary
- Tracking links

### Real-time Updates
- Auto-refresh every 30 seconds
- Firebase real-time listeners
- Instant status synchronization
- Cross-device consistency

## Configuration

### Email Service Setup
1. Configure email service provider (EmailJS, SendGrid, etc.)
2. Update API keys in `email-service.js`
3. Set up email templates
4. Configure webhook endpoints for delivery confirmation

### Firebase Configuration
1. Ensure Firebase project is properly configured
2. Set up Firestore security rules
3. Configure authentication
4. Set up Cloud Functions for automated status updates (optional)

### Server Configuration
The system works with the existing Express server on port 3002.

## Testing

### Manual Testing
1. Start the server: `node server.js`
2. Navigate to tracking page
3. Test with sample order numbers
4. Verify email notifications
5. Test responsive design

### Sample Data
The system includes sample orders for testing:
- Complete order timeline
- Realistic delivery dates
- Multiple order statuses
- Email notification simulation

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers supported

## Security Features
- User authentication required for personal orders
- Secure Firebase rules
- Input validation and sanitization
- HTTPS enforcement (production)
- Email rate limiting

## Future Enhancements

### Planned Features
- SMS notifications
- Push notifications
- Real-time GPS tracking
- Delivery photo confirmation
- Customer feedback integration
- Multi-language support

### API Integrations
- Shipping carrier APIs
- Google Maps integration
- Payment gateway webhooks
- Inventory management system

## Support
For technical support or questions about the tracking system:
- Check the help center: `help-center.html`
- Contact support through the website
- Review Firebase console for error logs

## Deployment Notes
- Update URLs from localhost to production domain
- Configure email service with production credentials
- Set up monitoring and logging
- Enable HTTPS
- Configure CDN for static assets

---

**Wood & Whimsy Development Team**  
*Premium Furniture & Café Experience*
