import { configureStore, combineReducers } from '@reduxjs/toolkit';
import basketReducer from './basketSlice';
import stocksReducer from './stocksSlice';

const rootReducer = combineReducers({
  basket: basketReducer,
  stocks: stocksReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};
