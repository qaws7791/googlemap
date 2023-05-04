import { createSlice } from "@reduxjs/toolkit";
const regionSlice = createSlice({
  name: "regionSlice",
  initialState: {
    region: {},
    center: {}
  },
  reducers: {
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setCenter: (state, action) => {
      state.center = action.payload;
    }
  }
});

export default regionSlice;
