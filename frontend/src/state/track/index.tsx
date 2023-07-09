import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TrackState {
  isModalOpen: boolean;
  newContent: string | undefined;
  src: File | undefined;
  totalLength: number;
  skipToPosition: string;
  hasSkipped: boolean;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  settings: {
    pauseOnSkip: boolean;
    goBackTime: number;
    goForwardTime: number;
  };
}

interface SetTrackPayload {
  src: string;
  totalLength: number;
}

const initialState: TrackState = {
  newContent: undefined,
  isModalOpen: false,
  src: undefined,
  totalLength: 0,
  skipToPosition: '00:00:00',
  hasSkipped: true,
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  playbackSpeed: 1,
  settings: {
    goBackTime: 10,
    goForwardTime: 50,
    pauseOnSkip: true,
  },
};

export const track = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<SetTrackPayload>) => {
      state.totalLength = action.payload.totalLength;
    },
    skipToPosition: (state, action: PayloadAction<string>) => {
      state.hasSkipped = false;
      state.skipToPosition = action.payload;
    },
    setToSkipped: (state) => {
      state.hasSkipped = true;
    },
    setSrc: (state, action: PayloadAction<File>) => {
      state.src = action.payload;
    },
    addNewContent: (state, action: PayloadAction<string>) => {
      state.newContent = action.payload;
    },
    removeNewContent: (state) => {
      state.newContent = undefined;
    },
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    }
  },
});

export const { addNewContent, removeNewContent, setTrack, skipToPosition, setToSkipped, toggleModal, setSrc } = track.actions;

export default track.reducer;
