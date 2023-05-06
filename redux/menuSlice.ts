import { createSlice } from "@reduxjs/toolkit";
const menuSlice = createSlice({
  name: "menuSlice",
  initialState: {
    currentMenu: 'near',
  },
  reducers: {
    changeMenuNear: (state) => {
      state.currentMenu = 'near';
    },
    changeMenuDong: (state) => {
      state.currentMenu = 'dong';
    }
  }
});

export default menuSlice;
