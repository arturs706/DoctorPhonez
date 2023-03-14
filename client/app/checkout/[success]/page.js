"use client"; // this is a client component 👈🏽

import { useEffect } from 'react';
import styles from './success.module.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../../redux/reducers/cartSlice';

export default function Page() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className={styles.successmain}>
      <h1>Payment succeeded for order</h1>
      <h2>Order ID: {searchParams.toString()}</h2>
    </div>
  );
}
