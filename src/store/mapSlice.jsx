import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: null,
  simulatingLocation:null,
  target: null,
  isRouting: false,
  isTraveling: false,
  simulating: false,
  lastSearchedPlace: null,
  liveLocation: null,
   mode: 'driving',
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCurrent(state, action) {
      state.current = action.payload;
    },
    setSimulatingLocation(state, action) {
      state.simulatingLocation = action.payload;
    },
    setTarget(state, action) {
      state.target = action.payload;
    },
    setIsRouting(state, action) {
      state.isRouting = action.payload;
    },
    setIsTraveling(state, action) {
      state.isTraveling = action.payload;
    },
    setSimulating(state, action) {
      state.simulating = action.payload;
    },
    setLastSearchedPlace(state, action) {
    state.lastSearchedPlace = action.payload;
    },
    setLiveLocation(state, action) {
    state.liveLocation = action.payload;
    },
    setMode(state, action) {
    state.mode = action.payload;
    },
  },
});

export const {
  setCurrent,
  setTarget,
  setIsRouting,
  setIsTraveling,
  setSimulating,
  setLastSearchedPlace, 
  setLiveLocation,
  setSimulatingLocation,
  setMode
} = mapSlice.actions;

export default mapSlice.reducer;
