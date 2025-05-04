import { Data } from "./MainReducer";
import { combineReducers , configureStore } from "@reduxjs/toolkit";
import basketReducer from "./basketSlice";

const rootReducer = combineReducers({
    Data,
    basket: basketReducer,
});

export const setupStore = () =>{
    return configureStore({
        reducer : rootReducer,
    })
}