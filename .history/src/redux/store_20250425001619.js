// redux/index.js veya store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import basketReducer from './basketSlice';
import stocksReducer from './stocksSlice'; // slice'ın default export'u

const rootReducer = combineReducers({
  basket: basketReducer,
  stocks: stocksReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};
