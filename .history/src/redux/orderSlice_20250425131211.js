import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shares: [],
  orderId: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setFormattedOrder: (state, action) => {
      const formatted = action.payload;

      if (!formatted || !Array.isArray(formatted.items)) return;

      const shareItems = formatted.items.map(({ id, ...rest }) => ({
        ...rest,
        orderId: formatted.id,
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

    
    },
    state.orderId = formatted.id || null;
  },
});

export const { setFormattedOrder } = orderSlice.actions;
export default orderSlice.reducer;
