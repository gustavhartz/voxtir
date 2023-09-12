import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface TrackState {
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
  currentPosition: string;
  presignedFileURL: string;
  presignedFileURLExpiresAtUnixMS: number;
  documentId: string;
}

const initialState: TrackState = {
  skipToPosition: '00:00:00',
  hasSkipped: true,
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  playbackSpeed: 1,
  settings: {
    goBackTime: 10,
    goForwardTime: 30,
    pauseOnSkip: false,
  },
  currentPosition: '00:00:00',
  presignedFileURL: '',
  presignedFileURLExpiresAtUnixMS: new Date().getTime(),
  documentId: '',
};

interface SetTrackPayload {
  presignedFileURL: string;
  presignedFileURLExpiresAtUnixMS: number;
  documentId: string;
}

export const track = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<SetTrackPayload>) => {
      state.presignedFileURL = action.payload.presignedFileURL;
      state.presignedFileURLExpiresAtUnixMS =
        action.payload.presignedFileURLExpiresAtUnixMS;
      state.documentId = action.payload.documentId;
    },
    skipToPosition: (state, action: PayloadAction<string>) => {
      state.hasSkipped = false;
      state.skipToPosition = action.payload;
    },
    setToSkipped: (state) => {
      state.hasSkipped = true;
    },
    setCurrentPosition: (state, action: PayloadAction<string>) => {
      state.currentPosition = action.payload;
    },
  },
});

export const { skipToPosition, setToSkipped, setCurrentPosition, setTrack } =
  track.actions;

export default track.reducer;
