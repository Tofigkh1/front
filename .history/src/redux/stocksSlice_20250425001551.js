// redux/stocksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from '../api';

export const fetchTableOrders = createAsyncThunk(
  'stocks/fetchTableOrders',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    tableOrders: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.tableOrders = action.payload;
      })
      .addCase(fetchTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default stocksSlice.reducer;
