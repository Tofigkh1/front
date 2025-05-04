import { Data } from "./MainReducer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import basketReducer from "./basketSlice";

// 💡 BURAYA EKLİYORUZ:
import stocksReducer from "./stocksSlice";  // ✅

const rootReducer = combineReducers({
    Data,
    basket: basketReducer,
    stocks: stocksReducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
    });
};
