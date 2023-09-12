import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';

interface ClientState {
  refetchPinned: boolean;
  latestProject: string;
}

const initialState: ClientState = {
  refetchPinned: false,
  latestProject: '',
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
    setLatestProject: (state, action: PayloadAction<string>) => {
      state.latestProject = action.payload;
    },
  },
});

export const { refetchPinned, refetchPinnedComplete, setLatestProject } =
  track.actions;

export default track.reducer;
