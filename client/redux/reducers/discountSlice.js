"use client"; // this is a client component 👈🏽

import { createSlice } from '@reduxjs/toolkit';

const getDiscountFromStorage = () => {
  if (typeof localStorage !== 'undefined') {
    const discount = localStorage.getItem('discount');
    return discount ? JSON.parse(discount) : null;
  }
  return null;
};

const setDiscountToStorage = (discountAmount) => {
  localStorage.setItem('discount', JSON.stringify(discountAmount));
};

export const discountSlice = createSlice({
  name: 'discountSlice',
  initialState: {
    discountAmount: getDiscountFromStorage(),
  },
  reducers: {
    setDiscountSlice: (state, action) => {
      state.discountAmount = action.payload;
      setDiscountToStorage(action.payload);
    },
    clearDiscountSlice: (state) => {
      state.discountAmount = null;
      setDiscountToStorage(null);
    },
  },
});

export const { setDiscountSlice, clearDiscountSlice } = discountSlice.actions;

export default discountSlice.reducer;
