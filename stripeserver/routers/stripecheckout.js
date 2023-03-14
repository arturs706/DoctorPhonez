require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();


router.post('/pay', async (req, res) => {
    // Use an existing Customer ID if this is a returning customer.
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2020-08-27'}
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      }
    });
  
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISH_KEY
    });
  });
  
  module.exports = router;