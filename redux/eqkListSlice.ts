import { createSlice } from "@reduxjs/toolkit";
const eqkListSlice = createSlice({
  name: "eqkListSlice",
  initialState: {
    eqkList: [],
  },
  reducers: {
    setEqks: (state, action) => {
      state.eqkList = action.payload;
    }
  }
});

export default eqkListSlice;
