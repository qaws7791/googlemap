import {configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import eqkListSlice from "./eqkListSlice";
import regionSlice from "./regionSlice";


const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    eqkList: eqkListSlice.reducer,
    region: regionSlice.reducer
  }
});

export default store;
