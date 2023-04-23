import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
};

export const saveUser = createAsyncThunk(
  'save/user',
  async (user) => user
);

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    save: (state, action) => {
      state["data"] = action.payload;
    },
  },
});

export const { save } = user.actions;

export const selectUser = (state) => state.user;

export default user.reducer;
