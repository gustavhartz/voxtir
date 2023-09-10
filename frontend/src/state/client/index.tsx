import { createSlice } from '@reduxjs/toolkit';

interface ClientState {
  refetchPinned: boolean;
}

const initialState: ClientState = {
  refetchPinned: false,
};

export const track = createSlice({
  name: 'track',
  initialState,
  reducers: {
    refetchPinned: (state) => {
      console.log('refetching pinned');
      state.refetchPinned = true;
    },
    refetchPinnedComplete: (state) => {
      state.refetchPinned = false;
    },
  },
});

export const { refetchPinned, refetchPinnedComplete } = track.actions;

export default track.reducer;
