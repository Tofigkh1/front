import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shares: [],
};

const stocksSlice = createSlice({
  name: "stocks",
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

      const totalAmount = shareItems.reduce((sum, item) => {
        return sum + item.quantity * item.price;
      }, 0);

      state.shares = [
        {
          type: "cash", // Bu sabit, istersen dinamik yapabilirim.
          amount: totalAmount,
          items: shareItems,
        },
      ];
    },
  },
});

export const { setFormattedOrder } = stocksSlice.actions;
export default stocksSlice.reducer;
