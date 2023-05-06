import { createSlice } from "@reduxjs/toolkit";
const regionSlice = createSlice({
  name: "regionSlice",
  initialState: {
    region: {},
    center: {},
    eqkList: [],
  },
  reducers: {
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setEqkList: (state, action) => {
      state.eqkList = action.payload;
    }
  }
});

export default regionSlice;
