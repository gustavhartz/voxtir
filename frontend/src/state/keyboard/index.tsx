import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface KeyboardState {
    playPause: string;
    skipForward: string;
    skipBackward: string;
    playbackUp: string;
    playbackDown: string;
    mute: string;
}
  
  const initialState: KeyboardState = {
    playPause: 'Escape',
    skipForward: 'ArrowRight',
    skipBackward: 'ArrowLeft',
    playbackUp: 'ArrowUp',
    playbackDown: 'ArrowDown',
    mute: 'm'
  }
  
  export const keyboard = createSlice({
    name: 'keyboard',
    initialState,
    reducers: {
        setPlayPause: (state, action: PayloadAction<string>) => {
            state.playPause = action.payload;
        },
        setSkipForward: (state, action: PayloadAction<string>) => {
            state.skipForward = action.payload;
        },
        setSkipBackward: (state, action: PayloadAction<string>) => {
            state.skipBackward = action.payload;
        },
        setPlaybackUp: (state, action: PayloadAction<string>) => {
            state.playbackUp = action.payload;
        },
        setPlaybackDown: (state, action: PayloadAction<string>) => {
            state.playbackDown = action.payload;
        },
        setMute: (state, action: PayloadAction<string>) => {
            state.mute = action.payload;
        }
    },
  })
  
  export const { 
    setPlayPause,
    setSkipForward,
    setMute,
    setSkipBackward,
    setPlaybackDown,
    setPlaybackUp
} = keyboard.actions;
  
  export default keyboard.reducer;