import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: true,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleCollapse(state) {
      state.isCollapsed = !state.isCollapsed;
    },
    setCollapse(state, action) {
      state.isCollapsed = action.payload;
    },
  },
});

export const { toggleCollapse, setCollapse } = sidebarSlice.actions;
export default sidebarSlice.reducer;
