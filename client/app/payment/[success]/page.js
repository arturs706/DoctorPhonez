"use client"; // this is a client component 👈🏽

import { useEffect, useState } from 'react';
import styles from './success.module.css';
import { useSearchParams } from 'next/navigation';
import { clearCart } from '../../../redux/reducers/cartSlice';
import Image from 'next/image';
import Link from 'next/link';
import { clearDiscountSlice } from '../../../redux/reducers/discountSlice';
import { useSelector, useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';


export default function Page() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch()
  const search = searchParams.get('payment_intent');
  const cart = useSelector(state => state.counter);


  useEffect(() => {
  
    fetch(process.env.NEXT_PUBLIC_API_URL + 'api/v1/refresh_token', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      const { email } = jwt_decode(data.accessToken);
      return fetch(process.env.NEXT_PUBLIC_API_URL + 'api/v1/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}`
        },
        body: JSON.stringify({
          cart: cart,
          email: email,
          payment_intent: search,
          shipping_address: JSON.parse(localStorage.getItem('shippingDetails')),
        })
      });
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Checkout API call failed');
      }
      return res.json();
    })
    .then(() => {
      localStorage.removeItem('shippingDetails');
      localStorage.removeItem('discount');
    })
    .catch((error) => {
      console.error('Error during API call:', error);
    });
    dispatch(clearDiscountSlice());
    dispatch(clearCart());
  }, []);
  
    
  return (
    <div className={styles.successmain}>
      <div className={styles.ovalblur}></div>
      <div className={styles.stepper}>
          <div className={styles.imgwrap}>
          <Image 
              src = "https://res.cloudinary.com/dttaprmbu/image/upload/v1679855139/etc/1_eimweq.svg"
              alt = "1"
              width = {50}
              height = {50}
          />
          <div className={styles.nameof}>Delivery</div>
          </div>
          <Image
              src = "https://res.cloudinary.com/dttaprmbu/image/upload/v1679855139/etc/active_qbtztb.svg"
              alt = "2"
              width = {80}
              height = {50}
          />
          
          <div className={styles.imgwrap}>
          <Image 
              src = "https://res.cloudinary.com/dttaprmbu/image/upload/v1679855139/etc/2_tgnnar.svg"
              alt = "1"
              width = {50}
              height = {50}
          />
          <div className={styles.nameof}>Payment</div>
          </div>
          <Image
              src = "https://res.cloudinary.com/dttaprmbu/image/upload/v1679855139/etc/active_qbtztb.svg"
              alt = "2"
              width = {80}
              height = {50}
          />
          <div className={styles.imgwrap}>
          <Image 
              src = "https://res.cloudinary.com/dttaprmbu/image/upload/v1679855139/etc/3_xiolbe.svg"
              alt = "1"
              width = {50}
              height = {50}
          />
          <div className={styles.nameofthree}>Confirmation</div>
          </div>
      </div>
      <h1>Your order has been received</h1>
      <Image
          src = "../../tickicon.svg"
          alt = "tick"
          width = {100}
          height = {100}
      />
      <h2>Thank you for your order!</h2>
      <h3>Your order number: {search} is now placed</h3>
      <h3>You will receive a confirmation email shortly</h3>
      <Link href="/"><div className={styles.btn}>Continue Shopping</div></Link>
    </div>
  );
}








// import { setProfile, setEmailAdd, setUserRole, setTokenExp } from './redux/reducers/profileSlice'

// const refreshToken = async (dispatch) => {
//     await (await fetch(process.env.NEXT_PUBLIC_API_URL + 'api/v1/login/success', {
//     // const result = await (await fetch("https://pm.doctorphonez.co.uk/api/v1/login/success", {
//     method: 'GET',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     }
//   })).json();
//   await fetch(process.env.NEXT_PUBLIC_API_URL + 'api/v1/refresh_token', {
//     // await fetch("https://pm.doctorphonez.co.uk/api/v1/refresh_token", {
//     method: 'POST',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     }
//   })
//   .then((res) => res.json())
//   .then((data) => {
//       if (data.err !== "jwt must be provided") {
//         const { email, exp, role } = jwt_decode(data.accessToken)
//         dispatch(setProfile(data.accessToken))
//         dispatch(setEmailAdd(email))
//         dispatch(setUserRole(role))
//         const isExpired = (exp * 1000) < new Date().getTime()
//         dispatch(setTokenExp(isExpired))
//       }
//   })
// }
          
  


// export default refreshToken;
