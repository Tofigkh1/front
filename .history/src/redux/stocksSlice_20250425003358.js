import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from "../api/index";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const fetchTableOrder = createAsyncThunk(
  "tableOrder/fetchTableOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());
      return response.data.table;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue({ message: "Network error" });
      }
    }
  }
);

const tableOrderSlice = createSlice({
  name: "tableOrder",
  initialState: {
    tableData: null,
    orders: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearTableOrder: (state) => {
      state.tableData = null;
      state.orders = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTableOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tableData = {
          id: action.payload.id,
          name: action.payload.name,
        };
        state.orders = action.payload.orders.map((order) => ({
          order_id: order.order_id,
          total_price: order.total_price,
          total_prepayment: order.total_prepayment,
          status: order.status,
          stocks: order.stocks.map((stock) => ({
            id: stock.id,
            name: stock.name,
            quantity: stock.quantity,
            price: stock.price,
            pivot_id: stock.pivot_id,
            detail: stock.detail,
          })),
        }));
      })
      .addCase(fetchTableOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Fetch failed";
      });
  },
});

export const { clearTableOrder } = stocksSlice.actions;

export default stocksSlice.reducer;
