import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { base_url } from "../api/index";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
};

// 🔄 Async thunk: masa siparişlerini getir
export const fetchTableOrders = createAsyncThunk(
  'tableOrders/fetchTableOrders',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Bir hata oluştu' });
    }
  }
);

const stocksSlice = createSlice({
  name: 'tableOrders',
  initialState: {
    tableName: '',
    tableOrders: [],
    ordersIdMassa: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableOrders.fulfilled, (state, action) => {
        const data = action.payload;
        const orders = data.table.orders;

        state.loading = false;
        state.tableName = data.table.name;
        state.tableOrders = orders;
        state.ordersIdMassa = orders.length > 0 ? {
          id: orders[0].order_id,
          total_price: orders[0].total_price,
          total_prepayment: orders[0].total_prepayment,
        } : null;
      })
      .addCase(fetchTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bir hata oluştu';
      });
  },
});

export default stocksSlice.reducer;
