import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shares: [],
  orderId: null, // 🆕 Order ID buraya eklendi
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setFormattedOrder: (state, action) => {
      const formatted = action.payload;

      if (!formatted || !Array.isArray(formatted.items)) return;

      const shareItems = formatted.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const totalAmount = shareItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      state.shares = [
        {
          type: "cash",
          amount: totalAmount,
          items: shareItems,
        },
      ];

      state.orderId = formatted.id || null; // 🆕 ID burada Redux'a yazılıyor
    },
  },
});

export const { setFormattedOrder } = orderSlice.actions;
export default orderSlice.reducer;
