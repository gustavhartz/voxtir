import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TrackState {
  isModalOpen: boolean;
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
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface SetTrackPayload {
  src: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

const initialState: TrackState = {
  isModalOpen: false,
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
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  fileType: '',
};

export const track = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<SetTrackPayload>) => {
      state.fileUrl = action.payload.src;
      state.fileName = action.payload.fileName;
      state.fileSize = action.payload.fileSize;
      state.fileType = action.payload.fileType;
    },
    skipToPosition: (state, action: PayloadAction<string>) => {
      state.hasSkipped = false;
      state.skipToPosition = action.payload;
    },
    setToSkipped: (state) => {
      state.hasSkipped = true;
    },
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
});

export const { setTrack, skipToPosition, setToSkipped, toggleModal } =
  track.actions;

export default track.reducer;
