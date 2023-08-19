import { configureStore } from '@reduxjs/toolkit';

import keyboard from './state/keyboard';
import track from './state/track';
export const store = configureStore({
  reducer: {
    track: track,
    keyboard: keyboard,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
