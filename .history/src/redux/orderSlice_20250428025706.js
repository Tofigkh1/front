import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import axios from "axios";
import { base_url } from "../api/index";

// Headers ayarı
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Async thunk
export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/orders/${id}`, getHeaders());
      const formatted = response.data;
      const items = formatted?.items || [];

      const shareItems = items.map(({ name, quantity, price }) => ({
        name,
        quantity,
        price,
      }));

      const totalAmount = shareItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      return {
        orderID: formatted.id || null,
        shares: [
          {
            type: "cash",
            amount: totalAmount,
            items: shareItems,
          },
        ],
        items: shareItems,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Order fetch failed");
    }
  }
);

// Slice tanımı
const orderSlice = createSlice({
  name: "order",
  initialState: {
    shares: [],
    orderID: null,
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.shares = [];
      state.orderID = null;
      state.items = [];
      state.error = null;
    },
    setFormattedOrder: (state, action) => {
      const { id, items } = action.payload;

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      state.orderID = id;
      state.shares = [
        {
          type: "cash",
          amount: totalAmount,
          items,
        },
      ];
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
        state.shares = action.payload.shares;
        state.orderID = action.payload.orderID;
        state.items = action.payload.items;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ❗ Persist config
const orderPersistConfig = {
  key: "order",
  storage,
  whitelist: ["orderID", "shares", "items"], // Hepsi kaydedilecek
};

export const { clearOrder, setFormattedOrder } = orderSlice.actions;

// ❗ Persist edilmiş reducer export ediyoruz
export default persistReducer(orderPersistConfig, orderSlice.reducer);
