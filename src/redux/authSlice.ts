import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isLoggedIn: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...(state.user as object), ...action.payload };
      }
    },
  }
});

export const { loginSuccess, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;