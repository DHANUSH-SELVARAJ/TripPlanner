import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './mapSlice';
import sidebarReducer from './sidebarSlice';

export const store = configureStore({
    reducer: {
        map: mapReducer,
        sidebar: sidebarReducer,
    },
});
