const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
const paymentRouter = require('./routers/stripecheckout');
const paymentIntent = require('./routers/paymentintent');
const cookieParser = require('cookie-parser');



const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api/v1/', paymentRouter);
app.use('/api/v1/', paymentIntent);

// app.post('/create-payment-intent', async (req, res) => {
//     const { amount, userid, productid, productqty } = req.body;
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: 'usd',
//       metadata: {integration_check: 'accept_a_payment'},
//       payment_method_types: ['card'],
//       receipt_email: 'test@test.com',
//       description: 'Test Payment',
//       shipping: {
//         name: 'Jenny Rosen',
//         address: {
//           line1: '510 Townsend St',
//           postal_code: '98140',
//           city: 'San Francisco',
//           state: 'CA',
//           country: 'US',
//         },
//       }
//     });
//       res.send({
//         clientSecret: paymentIntent.client_secret
//       });
  
//   });

app.listen(PORT, () => {
    console.log(`Server running on port ` + PORT);
    }
);
