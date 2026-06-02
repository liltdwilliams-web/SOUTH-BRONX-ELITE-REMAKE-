# Stripe Payment Integration Setup Guide

## Overview
Your website now has a complete checkout system integrated with Stripe, supporting:
- **Cash App** 
- **Apple Pay**
- Credit/Debit Cards
- ACH Transfers

## Setup Steps

### 1. Create a Stripe Account
- Go to [stripe.com](https://stripe.com)
- Sign up for a free account
- Verify your email

### 2. Get Your API Keys
- Log into your Stripe Dashboard
- Navigate to **Developers** → **API Keys**
- You'll see two keys:
  - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
  - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Update Frontend (index.html)
In `script.js`, find this line:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';
```

Replace `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE` with your actual publishable key from Stripe Dashboard.

### 4. Backend Setup (Node.js/Express)
You need to create a backend endpoint to handle payment intents. Here's a basic example:

```javascript
// Install dependencies
npm install express stripe cors dotenv

// .env file (keep this secret!)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
PORT=3000

// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('.')); // Serve your HTML/CSS/JS files

// Create Payment Intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Webhook endpoint (for production use)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment succeeded!', event.data.object);
      // Handle successful payment (e.g., send confirmation email, update database)
    }

    res.json({received: true});
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
```

### 5. Deployment (Heroku Example)
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 6. Update Frontend with Backend URL
Once your backend is deployed, update the fetch URL in `script.js`:

**For local development:**
```javascript
const response = await fetch('http://localhost:3000/create-payment-intent', {
```

**For production (Heroku):**
```javascript
const response = await fetch('https://your-app-name.herokuapp.com/create-payment-intent', {
```

## Payment Methods Enabled
Your Stripe integration automatically supports:
- ✅ **Cash App** - Popular payment app
- ✅ **Apple Pay** - Mobile payment (iOS)
- ✅ **Google Pay** - Mobile payment (Android)
- ✅ **Credit/Debit Cards** - Visa, Mastercard, American Express
- ✅ **ACH Bank Transfers** - Direct bank transfers (US)
- ✅ **iDEAL** - European payments
- ✅ **Alipay** - Chinese payments

## Testing Payments

### Test Card Numbers
**Success:**
- Card: `4242 4242 4242 4242`
- Exp: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)

**Decline:**
- Card: `4000 0000 0000 0002`

**3D Secure (requires authentication):**
- Card: `4000 0025 0000 3155`

## Important Security Notes
⚠️ **NEVER commit your secret key to GitHub!**
- Always use `.env` files for secrets
- Add `.env` to `.gitignore`
- In production, use environment variables provided by your hosting platform

## Going Live (Stripe Live Mode)
1. Complete your Stripe account verification
2. Switch from test keys to live keys in Stripe Dashboard
3. Update your `.env` file with live keys
4. Redeploy your backend

## Troubleshooting

**"Payment Element not loading"**
- Check your Stripe publishable key is correct
- Ensure your backend is running and accessible

**"Cannot POST /create-payment-intent"**
- Make sure your backend server is running
- Check the fetch URL matches your backend port/domain

**"Stripe is not defined"**
- Ensure `<script src="https://js.stripe.com/v3/"></script>` is in your HTML

## Support
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- Email: support@stripe.com

---

**Your website is now ready to accept real payments!** 💰
