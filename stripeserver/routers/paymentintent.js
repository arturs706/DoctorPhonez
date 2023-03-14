const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const express = require('express');
const router = express.Router();


router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  const roundedAmount = Math.round(amount * 100);

  console.log(roundedAmount)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: roundedAmount,
    currency: 'GBP',
    automatic_payment_methods: {
      enabled: true,
    },
    // metadata: {userid: userid, productid: productid, productqty: productqty},
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;

