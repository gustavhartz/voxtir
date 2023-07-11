import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface KeyboardState {
  isModalOpen: boolean;
  playPause: string;
  skipForward: string;
  skipBackward: string;
  playbackUp: string;
  playbackDown: string;
  volumeUp: string;
  volumeDown: string;
  mute: string;
}

const updateKeyboardStorage = (keyboardState: KeyboardState) => {
  localStorage.setItem('keyboard', JSON.stringify(keyboardState));
};

const getKeyboardStorage = () => {
  const keyboardStorage = localStorage.getItem('keyboard');
  if (keyboardStorage) {
    return JSON.parse(keyboardStorage);
  }
  return null;
};

const initialState: KeyboardState =
  localStorage.getItem('keyboard') !== null
    ? getKeyboardStorage()
    : {
        isModalOpen: false,
        playPause: 'Escape',
        skipForward: 'ArrowRight',
        skipBackward: 'ArrowLeft',
        playbackUp: 'ArrowUp',
        playbackDown: 'ArrowDown',
        volumeDown: 'n',
        volumeUp: 'p',
        mute: 'm',
      };

export const keyboard = createSlice({
  name: 'keyboard',
  initialState,
  reducers: {
    setPlayPause: (state, action: PayloadAction<string>) => {
      state.playPause = action.payload;
      updateKeyboardStorage(state);
    },
    setSkipForward: (state, action: PayloadAction<string>) => {
      state.skipForward = action.payload;
      updateKeyboardStorage(state);
    },
    setSkipBackward: (state, action: PayloadAction<string>) => {
      state.skipBackward = action.payload;
      updateKeyboardStorage(state);
    },
    setPlaybackUp: (state, action: PayloadAction<string>) => {
      state.playbackUp = action.payload;
      updateKeyboardStorage(state);
    },
    setPlaybackDown: (state, action: PayloadAction<string>) => {
      state.playbackDown = action.payload;
      updateKeyboardStorage(state);
    },
    setMute: (state, action: PayloadAction<string>) => {
      state.mute = action.payload;
      updateKeyboardStorage(state);
    },
    toggleModal: (state) => {
      console.log('toggling modal');
      state.isModalOpen = !state.isModalOpen;
      updateKeyboardStorage(state);
    },
    setVolumeDown: (state, action: PayloadAction<string>) => {
      state.volumeDown = action.payload;
      updateKeyboardStorage(state);
    },
    setVolumeUp: (state, action: PayloadAction<string>) => {
      state.volumeUp = action.payload;
      updateKeyboardStorage(state);
    },
  },
});

export const {
  setPlayPause,
  setSkipForward,
  setMute,
  setSkipBackward,
  setPlaybackDown,
  setPlaybackUp,
  setVolumeDown,
  setVolumeUp,
  toggleModal,
} = keyboard.actions;

export default keyboard.reducer;
