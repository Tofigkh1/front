import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getHeaders } from '../../utils/auth'; // varsayılan olarak burada
import { RootState } from '../store';

const base_url = process.env.REACT_APP_API_BASE_URL;

export const fetchStocks = createAsyncThunk(
  'stocks/fetchStocks',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/stocks`, {
        ...getHeaders(),
        params: groupId === 0 ? {} : { stock_group_id: groupId },
      });
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message ===
          'User does not belong to any  active restaurant.'
      ) {
        return rejectWithValue({ type: 'NO_ACTIVE_RESTAURANT' });
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTableOrders = createAsyncThunk(
  'stocks/fetchTableOrders',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());
      return response.data.table;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface StockState {
  stocks: any[];
  tableOrders: any[];
  tableName: string;
  ordersIdMassa: { id: number | null; total_price: number; total_prepayment: number };
  loading: boolean;
  error: string | null;
  activeUser: boolean;
}

const initialState: StockState = {
  stocks: [],
  tableOrders: [],
  tableName: '',
  ordersIdMassa: { id: null, total_price: 0, total_prepayment: 0 },
  loading: false,
  error: null,
  activeUser: false,
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchStocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action: any) => {
        state.loading = false;
        if (action.payload?.type === 'NO_ACTIVE_RESTAURANT') {
          state.activeUser = true;
        } else {
          state.error = action.payload || 'Stoklar yüklenemedi';
        }
      })

      // fetchTableOrders
      .addCase(fetchTableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableOrders.fulfilled, (state, action) => {
        const orders = action.payload.orders;
        state.loading = false;
        state.tableName = action.payload.name;
        state.tableOrders = orders.map((order: any) => ({
          totalPrice: order.total_price,
          total_prepayment: order.total_prepayment,
          items: order.stocks.map((stock: any) => ({
            id: stock.id,
            name: stock.name,
            // Diğer alanlar gerekiyorsa ekle
          })),
        }));
        state.ordersIdMassa = {
          id: orders[0]?.order_id,
          total_price: orders[0]?.total_price,
          total_prepayment: orders[0]?.total_prepayment,
        };
      })
      .addCase(fetchTableOrders.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Masa siparişleri yüklenemedi';
      });
  },
});

export default stocksSlice.reducer;

