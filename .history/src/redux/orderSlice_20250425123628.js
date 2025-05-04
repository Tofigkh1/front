import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shares: [
    {
      type: 'cash',
      amount: 0,
      items: [],
    },
  ],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderShares: (state, action) => {
      const { items } = action.payload;
      const totalAmount = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      state.shares[0] = {
        type: 'cash',
        amount: totalAmount,
        items,
      };
    },
  },
});

export const { setOrderShares } = orderSlice.actions;
export default orderSlice.reducer;
