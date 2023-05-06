import {configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import eqkListSlice from "./eqkListSlice";
import regionSlice from "./regionSlice";
import menuSlice from "./menuSlice";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    eqkList: eqkListSlice.reducer,
    region: regionSlice.reducer,
    menu: menuSlice.reducer,
  }
});

export default store;
