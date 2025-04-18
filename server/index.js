const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT || 10000;
const app = express();
const session = require('express-session');
const passport = require('passport');
const sessionSecret = process.env.SESSION_SECRET_KEY;
const userRouter = require('./routers/userrouter');
// const kafkaConsumer = require('./kafka/kafkaConsumer');
// const kafkaProducer = require('./kafka/kafkaProducer');
const paymentRouter = require('./routers/stripecheckout');
const paymentIntent = require('./routers/paymentintent');
const authRouter = require('./routers/auth');
const orderRouter = require('./routers/orders');
const productRouter = require('./routers/products');
const cookieParser = require('cookie-parser');
const favourites = require('./routers/favourites');
const delivery = require('./routers/delivery');
const emailRes = require('./routers/emailsub');
const ratings = require('./routers/ratings');
const discountCodes = require('./routers/discountcodes');

// Serve static files from the 'public' directory
app.use('/static', express.static(path.join(__dirname, 'public')));

const corsOptions = {
  origin: ['http://localhost:3000', 'https://dphonez.artdevdln.co.uk'],
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cookieParser());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  }
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOptions));
// app.use(kafkaConsumer);
// app.use(kafkaProducer);
app.use('/api/v1/', userRouter);
app.use('/api/v1/', paymentRouter)
app.use('/api/v1/', paymentIntent);
app.use('/api/v1', authRouter);
app.use('/api/v1', orderRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/favourites', favourites);
app.use('/api/v1/delivery', delivery);
app.use('/api/v1/', emailRes);
app.use('/api/v1/ratings', ratings);
app.use('/api/v1/discountcodes', discountCodes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
