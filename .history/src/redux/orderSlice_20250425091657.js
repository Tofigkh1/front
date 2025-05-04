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

// Quick Orders üzrə məlumatı gətir və formatla
export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/quick-orders/${id}`, getHeaders());

      const order = response.data.order;
      const items = order.stocks.map((stock) => ({
        name: stock.name,
        quantity: stock.quantity,
        price: stock.price,
      }));

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      return {
        orderId: order.id,
        shares: [
          {
            type: "cash",
            amount: totalAmount,
            items,
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
    loading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.shares = [];
      state.orderId = null;
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
        state.shares = action.payload.shares;
        state.orderId = action.payload.orderId;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
