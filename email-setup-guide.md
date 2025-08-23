# Email Setup Guide for Wood & Whimsy

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for free account
3. Create a new service (Gmail recommended)

### Step 2: Configure Email Service
1. **Service ID**: `service_woodwhimsy`
2. **Template ID**: `template_order_confirm`
3. **Public Key**: Get from EmailJS dashboard

### Step 3: Create Email Template
Use this template in EmailJS:

```
Subject: Order Confirmed - {{order_id}} | Wood & Whimsy

Dear {{to_name}},

🎉 Your order has been confirmed!

ORDER DETAILS:
- Order ID: {{order_id}}
- Tracking Number: {{tracking_number}}
- Payment Method: {{payment_method}}
- Total: {{total_amount}}
- Order Date: {{order_date}}
- Items: {{items_count}} item(s)

Track your order: {{track_url}}

Thank you for choosing Wood & Whimsy!

Best regards,
Wood & Whimsy Team
```

### Step 4: Update Configuration
Replace `YOUR_PUBLIC_KEY` in checkout.js with your actual EmailJS public key.

## Alternative: Use Formspree (Even Easier)

If EmailJS seems complex, use Formspree:

1. Go to [Formspree.io](https://formspree.io/)
2. Create form with your email
3. Get endpoint URL
4. Much simpler integration

## Test Email
After setup, test with your own email address to verify it works.
