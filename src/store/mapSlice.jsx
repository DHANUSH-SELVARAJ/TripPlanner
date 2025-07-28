import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: null,
  defaultCurrent: null,
  target: null,
  shouldRoute: false,
  isRouting: false,
  isTraveling: false,
  simulating: false,
  travelMarkerPos: null,
  routePath: [],  
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCurrent(state, action) {
      state.current = action.payload;
    },
    setDefaultCurrent(state, action) {
      state.defaultCurrent = action.payload;
    },
    setTarget(state, action) {
      state.target = action.payload;
    },
    setShouldRoute(state, action) {
      state.shouldRoute = action.payload;
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
    setTravelMarkerPos(state, action) {
      state.travelMarkerPos = action.payload;
    },
    resetOrigin(state) {
      state.current = state.defaultCurrent;
    },
  },
});

export const {
  setCurrent,
  setDefaultCurrent,
  setTarget,
  setShouldRoute,
  setIsRouting,
  setIsTraveling,
  setSimulating,
  setTravelMarkerPos,
  resetOrigin,
} = mapSlice.actions;

export default mapSlice.reducer;
