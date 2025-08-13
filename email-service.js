// Email Service for Order Tracking Notifications
// This module handles sending email notifications for order updates

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Email templates for different order statuses
const emailTemplates = {
  processing: {
    subject: "Order Received - We're Processing Your Order",
    template: (orderData) => `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 2rem;">🪵 Wood & Whimsy</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0 0;">Premium Furniture & Café</p>
        </div>
        
        <div style="padding: 2rem;">
          <h2 style="color: #2d3748; margin-bottom: 1rem;">📋 Order Received!</h2>
          <p style="color: #4a5568; line-height: 1.6;">
            Thank you for your order! We've received your request and are now processing it with care.
          </p>
          
          <div style="background: #f7fafc; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:3002/track.html" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              🚚 Track Your Order
            </a>
          </div>
          
          <p style="color: #718096; font-size: 0.9rem; margin-top: 2rem;">
            You'll receive updates as your order progresses through our workshop.
          </p>
        </div>
      </div>
    `
  },
  
  confirmed: {
    subject: "Order Confirmed - Payment Processed Successfully",
    template: (orderData) => `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 2rem;">✅ Order Confirmed!</h1>
        </div>
        
        <div style="padding: 2rem;">
          <p style="color: #4a5568; line-height: 1.6;">
            Great news! Your payment has been processed and your order is confirmed. 
            Our skilled craftsmen will begin working on your furniture soon.
          </p>
          
          <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #2d3748; margin-top: 0;">✅ Payment Confirmed</h3>
            <p><strong>Order:</strong> ${orderData.orderId}</p>
            <p><strong>Total:</strong> $${orderData.total}</p>
            <p><strong>Status:</strong> Confirmed & Ready for Production</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:3002/track.html" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              View Order Status
            </a>
          </div>
        </div>
      </div>
    `
  },
  
  shipped: {
    subject: "Your Order is On Its Way! 🚚",
    template: (orderData) => `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 2rem;">🚚 Order Shipped!</h1>
        </div>
        
        <div style="padding: 2rem;">
          <p style="color: #4a5568; line-height: 1.6;">
            Exciting news! Your beautifully crafted furniture has left our workshop and is now on its way to you.
          </p>
          
          <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #2d3748; margin-top: 0;">🚚 Shipping Information</h3>
            <p><strong>Order:</strong> ${orderData.orderId}</p>
            <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:3002/track.html" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              🗺️ Track Delivery
            </a>
          </div>
          
          <p style="color: #718096; font-size: 0.9rem;">
            Please ensure someone is available to receive your delivery on the estimated date.
          </p>
        </div>
      </div>
    `
  },
  
  delivered: {
    subject: "Order Delivered Successfully! 🎉",
    template: (orderData) => `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 2rem;">🎉 Delivered!</h1>
        </div>
        
        <div style="padding: 2rem;">
          <p style="color: #4a5568; line-height: 1.6;">
            Congratulations! Your Wood & Whimsy furniture has been successfully delivered. 
            We hope you love your new pieces!
          </p>
          
          <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #2d3748; margin-top: 0;">✅ Delivery Complete</h3>
            <p><strong>Order:</strong> ${orderData.orderId}</p>
            <p><strong>Delivered:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${orderData.deliveryAddress}</p>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="http://localhost:3002/help-center.html" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin-right: 1rem;">
              📞 Contact Support
            </a>
            <a href="http://localhost:3002/index.html#products" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              🛍️ Shop More
            </a>
          </div>
          
          <p style="color: #718096; font-size: 0.9rem;">
            Thank you for choosing Wood & Whimsy! We'd love to hear about your experience.
          </p>
        </div>
      </div>
    `
  }
};

// Main email service class
export class EmailService {
  constructor() {
    this.apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send'; // Example endpoint
    this.serviceId = 'wood_whimsy_service'; // Would be configured in EmailJS
    this.templateId = 'order_tracking_template';
    this.publicKey = 'your_emailjs_public_key'; // Would be from EmailJS
  }

  // Send order tracking email
  async sendTrackingEmail(orderData, recipientEmail, status = 'processing') {
    try {
      const template = emailTemplates[status];
      if (!template) {
        throw new Error(`No email template found for status: ${status}`);
      }

      const emailData = {
        to: recipientEmail,
        subject: template.subject,
        html: template.template(orderData),
        orderId: orderData.orderId,
        status: status,
        sentAt: new Date().toISOString()
      };

      // In a real application, you would send this via your email service
      // For now, we'll simulate sending and store in Firebase
      await this.logEmailNotification(emailData, orderData.userId);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📧 Email sent successfully to ${recipientEmail}:`, emailData.subject);
      return { success: true, emailData };
      
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Log email notification to Firebase
  async logEmailNotification(emailData, userId) {
    try {
      const notificationsRef = collection(db, 'emailNotifications');
      await addDoc(notificationsRef, {
        ...emailData,
        userId: userId,
        createdAt: serverTimestamp(),
        delivered: true // In real app, this would be updated by webhook
      });
    } catch (error) {
      console.error('Error logging email notification:', error);
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(orderData, newStatus, recipientEmail) {
    return await this.sendTrackingEmail(orderData, recipientEmail, newStatus);
  }

  // Send bulk notifications (for admin use)
  async sendBulkNotifications(orders, status) {
    const results = [];
    
    for (const order of orders) {
      try {
        const result = await this.sendTrackingEmail(order, order.customerEmail, status);
        results.push({ orderId: order.orderId, success: true, result });
      } catch (error) {
        results.push({ orderId: order.orderId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Generate tracking report email
  generateTrackingReport(orderData) {
    const currentStatus = orderData.currentStatus || 'processing';
    const template = emailTemplates[currentStatus];
    
    return {
      subject: `Order Tracking Report: ${orderData.orderId}`,
      html: template.template(orderData),
      text: this.generatePlainTextReport(orderData)
    };
  }

  // Generate plain text version of tracking report
  generatePlainTextReport(orderData) {
    return `
Wood & Whimsy - Order Tracking Report

Order Number: ${orderData.orderId}
Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
Current Status: ${orderData.currentStatus}
Estimated Delivery: ${new Date(orderData.estimatedDelivery).toLocaleDateString()}
Delivery Address: ${orderData.deliveryAddress}

Track your order online: http://localhost:3002/track.html

Thank you for choosing Wood & Whimsy!

---
Wood & Whimsy Team
Nsawam Dobro 142, Akuapim District, Eastern Region
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Helper function for easy import
export async function sendOrderEmail(orderData, recipientEmail, status = 'processing') {
  return await emailService.sendTrackingEmail(orderData, recipientEmail, status);
}

console.log('📧 Email service module loaded successfully!');
