import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "userSlice",
  initialState: {
    position: {
    lat: 37.551572,
    lng: 126.991345
    },
    distance_meter: 10_000
  },
  reducers: {
    changePosition: (state, action) => {
      state.position = action.payload;
    },
    changeDistance: (state,action) => {
      state.distance_meter = action.payload;
    }
  }
});

export default userSlice;
