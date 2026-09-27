import { configureStore } from '@reduxjs/toolkit';
import releasesReducer from './releasesSlice';

export const store = configureStore({
  reducer: {
    releases: releasesReducer
  }
});

export default store;
