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

export const fetchTableOrderStocks = createAsyncThunk(
  'stocks/fetchTableOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${base_url}/tables/${id}/order`, getHeaders());

      const table = response.data.table;
      const orders = table.orders;

      const formattedOrders = orders.map((order) => ({
        order_id: order.order_id,
        total_price: order.total_price,
        total_prepayment: order.total_prepayment,
        items: order.stocks.map((stock) => ({
          id: stock.id,
          name: stock.name,
          quantity: stock.quantity,
          price: stock.price,
          pivot_id: stock.pivot_id,
          unit: stock.detail?.unit,
          count: stock.detail?.count,
          detail_id: stock.detail?.id,
        })),
      }));

      const allItems = formattedOrders.flatMap((order) => order.items);

      return {
        tableName: table.name,
        orders,
        allItems,
        orderInfo: {
          id: orders[0]?.order_id || null,
          total_price: orders[0]?.total_price || 0,
          total_prepayment: orders[0]?.total_prepayment || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch table order');
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    tableName: '',
    orders: [],
    allItems: [],
    orderInfo: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearTableOrder: (state) => {
      state.tableName = '';
      state.orders = [];
      state.allItems = [];
      state.orderInfo = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.tableName = action.payload.tableName;
        state.orders = action.payload.orders;
        state.allItems = action.payload.allItems;
        state.orderInfo = action.payload.orderInfo;
      })
      .addCase(fetchTableOrderStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTableOrder } = stocksSlice.actions;

export default stocksSlice.reducer;
