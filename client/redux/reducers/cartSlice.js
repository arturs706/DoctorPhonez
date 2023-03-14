"use client"; // this is a client component 👈🏽

import { createSlice } from '@reduxjs/toolkit';
import { getCookie, hasCookie, setCookie } from 'cookies-next';

//create a function to get the cart from the cookie if it exists
export const getCartFromCookie = () => {
  if (hasCookie('cart')) {
    return JSON.parse(getCookie('cart'));
  } else {
    return [];
  }
};

//create a function to set the cart to the cookie
export const setCartToCookie = (cart) => {
  setCookie('cart', JSON.stringify(cart));
};


export const cartSlice = createSlice({
  name: 'cart',
  initialState: getCartFromCookie(),
  reducers: {
    addToCart: (state, action) => {
      const itemExists = state.find((item) => item.prodname === action.payload.prodname);
      if (itemExists) {
        itemExists.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
      setCartToCookie(state);
    },
    removeFromCart: (state, action) => {
      const newState = state.filter((item) => item.prodname !== action.payload);
      setCartToCookie(newState);
      return newState;
    },
    incrementQuantity: (state, action) => {
      const item = state.find((item) => item.prodname === action.payload);
      item.quantity += 1;
      setCartToCookie(state);
    },
    decrementQuantity: (state, action) => {
      const item = state.find((item) => item.prodname === action.payload);
      if (item.quantity > 1) {
        item.quantity -= 1;
        setCartToCookie(state);
      } else if (item.quantity === 1) {
        const newState = state.filter((item) => item.prodname !== action.payload);
        //set the cart to the cookie
        setCartToCookie(newState);
        return newState;
      }
    },
    clearCart: () => {
      setCartToCookie([]);
      return [];
    }
  }
});

export const selectCartItems = (state) => state.cart;

export const {
  addToCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
