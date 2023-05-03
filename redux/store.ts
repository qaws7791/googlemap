import {configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import eqkListSlice from "./eqkListSlice";


const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    eqkList: eqkListSlice.reducer,
  }
});

export default store;
