import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as any[] },
  reducers: {
    addToCart: (state, action) => {
      const itemExists = state.items.find((item) => item.id === action.payload.id);
      if (itemExists) {
        itemExists.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        } else {
          item.quantity -= 1;
        }
      }
    }
  }
});

export const { addToCart, incrementQuantity, decrementQuantity } = cartSlice.actions;
export default cartSlice.reducer;