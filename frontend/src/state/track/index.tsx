import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface TrackState {
    src: string;
    totalLength: number;
    currentPosition: number;
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
    currentPosition: 0,
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
        }
    },
  })
  
  export const { 
    setTrack
} = track.actions;
  
  export default track.reducer;