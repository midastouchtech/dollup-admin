import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import logger from 'redux-logger'


export const store = configureStore({
  middleware: [logger],
  reducer: {
    user,
  },
});
