import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getHeaders } from '../../utils/auth'; // varsa buradan import et

const base_url = process.env.REACT_APP_API_BASE_URL;

// 🔄 Stocks verilerini getir
export const fetchStocks = createAsyncThunk(
  'stocks/fetchStocks',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/stocks`, {
        ...getHeaders(),
        params: groupId === 0 ? {} : { stock_group_id: groupId },
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          'User does not belong to any  active restaurant.'
      ) {
        return rejectWithValue({ message: 'NO_ACTIVE_RESTAURANT' });
      }
      return rejectWithValue(error.response?.data || { message: 'Error' });
    }
  }
);

// 🍽 Masa siparişlerini getir
export const fetchTableOrders = createAsyncThunk(
  'stocks/fetchTableOrders',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error' });
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    stocks: [],
    tableOrders: [],
    tableName: '',
    ordersIdMassa: null,
    activeUser: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // 📦 fetchStocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.message === 'NO_ACTIVE_RESTAURANT') {
          state.activeUser = true;
        } else {
          state.error = action.payload;
        }
      })

      // 🧾 fetchTableOrders
      .addCase(fetchTableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableOrders.fulfilled, (state, action) => {
        state.loading = false;

        const table = action.payload.table;
        state.tableOrders = table.orders;
        state.tableName = table.name;

        if (table.orders.length > 0) {
          state.ordersIdMassa = {
            id: table.orders[0].order_id,
            total_price: table.orders[0].total_price,
            total_prepayment: table.orders[0].total_prepayment,
          };
        } else {
          state.ordersIdMassa = null;
        }
      })
      .addCase(fetchTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default stocksSlice.reducer;
