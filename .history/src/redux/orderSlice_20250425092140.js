import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
        orderId: formatted.id || null,
        shares: [
          {
            type: "cash",
            amount: totalAmount,
            items: shareItems,
          },
        ],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Order fetch failed");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    shares: [],
    orderId: null,
    items: [], // <-- yeni eklendi
    loading: false,
    error: null,
  },
  js
  Copy
  Edit
  
  reducers: {
    clearOrder: (state) => {
      state.shares = [];
      state.orderId = null;
      state.error = null;
    },
    setFormattedOrder: (state, action) => {
      const { id, items } = action.payload;

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      state.orderId = id;
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
        state.orderId = action.payload.orderId;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrder, setFormattedOrder } = orderSlice.actions;
export default orderSlice.reducer;
