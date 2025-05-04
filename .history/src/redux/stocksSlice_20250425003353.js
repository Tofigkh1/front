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

export const fetchTableOrders = createAsyncThunk(
  'tableOrders/fetchTableOrders',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Network error' });
    }
  }
);

const stocksSlice = createSlice({
  name: 'tableOrders',
  initialState: {
    table: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTableOrders: (state) => {
      state.table = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.table = action.payload.table;
      })
      .addCase(fetchTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch table orders';
      });
  },
});

export const { clearTableOrders } = stocksSlice.actions;
export default stocksSlice.reducer;
