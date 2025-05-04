// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import basketReducer from './basketSlice';
import stocksReducer from './stocksSlice';

export function setupStore(preloadedState) {
  return configureStore({
    reducer: {
      basket: basketReducer,
      stocks: stocksReducer,
    },
    preloadedState,
  });
}

export const store = setupStore(); // Create the actual store for use

export const RootState = store.getState;
export const AppDispatch = store.dispatch;
