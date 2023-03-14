"use client"; // this is a client component 👈🏽

import { useEffect, useState } from 'react'
import styles from './checkout.module.css'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'
import { useSelector } from 'react-redux'


const stripePromise = loadStripe("pk_test_51MfhShFrvj0XKeq0C4CoNcKSCcHgBSOKzDZBIkNmuoNdtwRifkT6Y7Nl9Ky53fABvIC2A2kqIb0sFNhZ9xUCspT600lW4FNBcc");

export default function Page() {
    const [clientSecret, setClientSecret] = useState("");
    const cart = useSelector(state => state.counter)


    useEffect(() => {
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        // Create PaymentIntent as soon as the page loads
        fetch("http://localhost:4000/api/v1/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount: total
          }),
        })
          .then((res) => res.json())
          .then((data) => setClientSecret(data.clientSecret));
      }, [cart]);

      const appearance = {
        theme: 'night',
        variables: {
          colorPrimary: '#000235',
          colorBackground: '#ffffff',
          colorText: '#000235',
        },
      };
      const options = {
        clientSecret,
        appearance,
      };

    return (
        <div className={styles.checkoutmain}>
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      )
}
