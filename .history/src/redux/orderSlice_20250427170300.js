import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import axios from "axios";
import { base_url } from "../api/index";

// Header fonksiyonu
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// API'den orderları çekiyoruz
export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/orders/${id}`, getHeaders());
      const formatted = response.data;

      const orders = Array.isArray(formatted) ? formatted : [formatted]; // Gelen veri array değilse array yap

      const allOrders = orders.map(order => {
        const items = order?.items || [];

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
          orderID: order.id || null,
          shares: [
            {
              type: "cash",
              amount: totalAmount,
              items: shareItems,
            },
          ],
          items: shareItems,
        };
      });

      return allOrders; // ❗ artık array dönüyoruz
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Order fetch failed");
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [], // ❗ Çoklu orderları burada tutuyoruz
    loading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.orders = [];
      state.error = null;
    },
    setFormattedOrder: (state, action) => {
      const { id, items } = action.payload;

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      const newOrder = {
        orderID: id,
        shares: [
          {
            type: "cash",
            amount: totalAmount,
            items,
          },
        ],
        items,
      };

      state.orders.push(newOrder);
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
        state.orders = action.payload; // ❗ doğrudan orders array
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Persist config
const orderPersistConfig = {
  key: "order",
  storage,
  whitelist: ["orders"], // sadece orders array'i kaydedeceğiz
};

// Exportlar
export const { clearOrder, setFormattedOrder } = orderSlice.actions;
export default persistReducer(orderPersistConfig, orderSlice.reducer);
