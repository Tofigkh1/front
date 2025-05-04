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

      // Əgər məlumat düzgün deyilsə, çıx
      if (!formatted || !Array.isArray(formatted.items)) return;

      // Hər bir item-ə orderId əlavə et
      const shareItems = formatted.items.map((item) => ({
        ...item,
        orderId: formatted.id,
      }));

      // Məbləği hesablamaq üçün quantity və price yoxlanılır
      const totalAmount = shareItems.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        return sum + quantity * price;
      }, 0);

      state.shares = [
        {
          type: "cash",
          amount: totalAmount,
          items: shareItems,
        },
      ];

      state.orderId = formatted.id || null;
    },
  },
});

export const { setFormattedOrder } = orderSlice.actions;
export default orderSlice.reducer;
