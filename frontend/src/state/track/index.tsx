import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface TrackState {
    src: string;
    totalLength: number;
    skipToPosition: string;
    hasSkipped: boolean;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    playbackSpeed: number;

}

interface SetTrackPayload {
    src: string;
    totalLength: number;
}
  
  const initialState: TrackState = {
    src: '',
    totalLength: 0,
    skipToPosition: "00:00:00",
    hasSkipped: true,
    isPlaying: false,
    volume: 0.5,
    isMuted: false,
    playbackSpeed: 1
  }
  
  export const track = createSlice({
    name: 'track',
    initialState,
    reducers: {
        setTrack: (state, action: PayloadAction<SetTrackPayload>) => {
            state.src = action.payload.src;
            state.totalLength = action.payload.totalLength;
        },
        skipToPosition: (state, action: PayloadAction<string>) => {
            state.hasSkipped = false;
            state.skipToPosition = action.payload;
        },
        setToSkipped: (state) => {
            state.hasSkipped = true;
        }
    },
  })
  
  export const { 
    setTrack,
    skipToPosition,
    setToSkipped
} = track.actions;
  
  export default track.reducer;