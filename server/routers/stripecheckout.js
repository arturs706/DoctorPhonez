require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const client = require('../db/conn');
var moment = require('moment'); 
const bodyParser = require('body-parser');
const authenticateToken = require('../middleware/authz');
const { v4: uuidv4 } = require('uuid'); 


const orderConfirmationTemplate = (customer_name, total, items, trackingnumber, deliveryDateDiffformt) => `
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>DoctorPhonez Order Confirmation</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
  </head>
  <body style="background-color: #fff; font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.4; color: #000235;">
    <div style="background-color: #000235; padding: 20px; color: #fff; text-align: center;">
      <h1 style="margin-top: 20px;">DoctorPhonez</h1>
    </div>
    <div style="padding: 20px;">
      <p>Dear ${customer_name},</p>
      <p>Thank you for your order! We are pleased to confirm that your order has been received and is being processed. Your order details are as follows:</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <thead style="background-color: #000235; color: #fff;">
          <tr>
            <th style="padding: 10px; text-align: left;">Photo</th>
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #ccc;">
              <td style="padding: 10px;"><img src="${item.image_url}" alt="${item.product_name}" style="max-width: 100px;"></td>
              <td style="padding: 10px;">${item.product_name}</td>
              <td style="padding: 10px;">${item.quantity}</td>
              <td style="padding: 10px;">£${item.price}</td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 10px;"></td>
            <td style="padding: 10px;"></td>
            <td style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px;"><strong>£${total}</strong></td>
          </tr>
        </tbody>
      </table>
      <p>We will send you another email once your order has been shipped. Your tracking number is ${trackingnumber}. Your estimated delivery date is ${deliveryDateDiffformt}. If you have any questions or concerns, please don't hesitate to contact us at support@doctorphonez.co.uk.</p>
    </div>
    <div style="background-color: #000235; padding: 20px; color: #fff; text-align: center;">
      <p style="margin-top: 20px;">This email confirms that your order has been received and processed. Thank you for shopping at DoctorPhonez!</p>
    </div>
  </body>
</html>`




const establishConnection = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });
  return transporter;
}

const sendEmail = async (customerEmail, customerName, total, items, trackingnumber, deliveryDateDiffformt) => {
  try {
    const transporter = await establishConnection();
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: customerEmail,
      subject: "Order Confirmation",
      html: orderConfirmationTemplate(customerName, total, items, trackingnumber, deliveryDateDiffformt)
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
  

router.post('/checkout', bodyParser.json(), authenticateToken, async (req, res) => {
  const body = req.body;
  const userEmail = req.user.email;
  const user = await client.query('SELECT * FROM users WHERE email = $1', [userEmail]);
  const userId = user.rows[0].usid;
  const orderId = uuidv4();
  const deliveryId = uuidv4();
  const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const totalCost = body.cart.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  const paymentMeth = 'card'; 
  const cardEndNr = '1234'; 
  const plannedDeliveryTime = moment().add(5, 'days').toDate();

  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO userorders (orderid, userid, useremail, totalcost, receiptlink, paymentmeth, cardendnr) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [orderId, userId, userEmail, totalCost, body.payment_intent, paymentMeth, cardEndNr]
    );

    for (const item of body.cart) {
      await client.query(
        'INSERT INTO orderitems (orderid, productname, quantity, price, color, memory, imageurl) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [orderId, item.prodname, item.quantity, item.price, item.color, item.memory, item.imageone]
      );
    }

    const { firstName, lastName, firstLine, secondLine, town, postcode } = body.shipping_address;
    await client.query(
      'INSERT INTO shippingaddress (orderid, firstline, secondline, city, postcode, tracking_number, postage_time, planned_delivery_time, last_update, status) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), $8)',
      [orderId, firstLine, secondLine, town, postcode, trackingNumber, plannedDeliveryTime, 'Order placed']
    );

    await client.query(
      'INSERT INTO delivery (id, tracking_number, postcode, address) VALUES ($1, $2, $3, $4)',
      [deliveryId, trackingNumber, postcode, `${firstLine}, ${secondLine}, ${town}`]
    );

    await client.query(
      'INSERT INTO delivery_tracking (id, delivery_id, status, status_time) VALUES ($1, $2, $3, NOW())',
      [uuidv4(), deliveryId, 'Order placed']
    );

    await client.query('COMMIT');
    sendEmail(userEmail, `${firstName} ${lastName}`, totalCost, body.cart, trackingNumber, plannedDeliveryTime.format('DD/MM/YYYY'));

    res.status(200).json({ message: 'Order placed successfully', trackingNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'Error processing order' });
  }
});

module.exports = router;