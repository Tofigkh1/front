import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import axios from "axios";
import { base_url } from "../api/index";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (orderId, { rejectWithValue }) => { // Parametre adını orderId olarak değiştir
    try {
      const response = await axios.get(`${base_url}/orders/${orderId}`, getHeaders());
      const formatted = response.data;
      const items = formatted?.items || [];

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      return {
        orderId, // Gönderilen orderId'yi kullan
        items,
        totalAmount
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Order fetch failed");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.orders = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, items, totalAmount } = action.payload;
        
        state.orders[orderId] = {
          orderId,
          shares: [{
            type: "cash",
            amount: totalAmount,
            items,
          }],
          items,
          totalAmount
        };
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const orderPersistConfig = {
  key: "order",
  storage,
  whitelist: ["orders"],
  migrate: (state) => {
    if (state && state.orders) {
      return Promise.resolve(state);
    }
    return Promise.resolve({ orders: {}, loading: false, error: null });
  },
};

export const { clearOrder } = orderSlice.actions;
export default persistReducer(orderPersistConfig, orderSlice.reducer);