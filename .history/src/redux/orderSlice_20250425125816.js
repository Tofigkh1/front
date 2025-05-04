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
        orderId: formatted.id, // 🔁 Her item'a orderId eklendi
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

      state.orderId = formatted.id || null; // Order ID ayrıca tutuluyor
    },
  },
});
