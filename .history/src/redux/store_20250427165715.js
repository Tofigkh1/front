import { Data } from "./MainReducer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import basketReducer from "./basketSlice";
import orderReducer from "./orderSlice"; // Persist edilmiş hali
import stocksReducer from "./stocksSlice";

const rootReducer = combineReducers({
    Data,
    basket: basketReducer,
    stocks: stocksReducer,
    order: orderReducer, // persistli order
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false, // persist için şart
            }),
    });
};
