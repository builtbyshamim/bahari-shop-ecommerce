import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
  mobileValue: false,
  cartValue: false,
  loginValue: false,
  registerValue: false,
  forgotPassword: false,
  setPassword: false,
};

export const toggleSlice = createSlice({
  name: "sidebarToggle",
  initialState,
  reducers: {
    sidebartoggle: (state) => {
      state.value = !state.value;
    },
    mobileToggle: (state) => {
      state.mobileValue = !state.mobileValue;
    },
    cartMenuToggle: (state) => {
      state.cartValue = !state.cartValue;
    },
    loginModalToggle: (state) => {
      state.loginValue = !state.loginValue;
    },
    registerModalToggle: (state) => {
      state.registerValue = !state.registerValue;
    },
    forgotPasswordModalToggle: (state) => {
      state.forgotPassword = !state.forgotPassword;
    },
    setPasswordModalToggle: (state) => {
      state.setPassword = !state.setPassword;
    },
  },
});

export const {
  sidebartoggle,
  mobileToggle,
  cartMenuToggle,
  loginModalToggle,
  registerModalToggle,
  forgotPasswordModalToggle,
  setPasswordModalToggle,
} = toggleSlice.actions;

export default toggleSlice.reducer;
