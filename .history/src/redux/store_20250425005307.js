import { configureStore } from '@reduxjs/toolkit';
import basketReducer from './basketSlice';
import stocksReducer from './stocksSlice';

export const store = configureStore({
  reducer: {
    basket: basketReducer,
    stocks: stocksReducer,
  },
});

// Eğer TypeScript kullanıyorsan:
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
