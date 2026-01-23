import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  userInfo: null,
  // Add more user-related state if needed
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.userInfo = null;
    },
  },
});

export const { setAccessToken, setUserInfo, clearAuth } = authSlice.actions;
export const selectToken = (state: { auth: { accessToken: string } }) =>
  state.auth.accessToken;
export const selectUser = (state: { auth: { userInfo: unknown } }) =>
  state.auth.userInfo;
export default authSlice.reducer;
