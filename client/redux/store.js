import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../redux/reducers/cartSlice'
import { HYDRATE } from 'next-redux-wrapper'


export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [HYDRATE],
      },
    }),
})


