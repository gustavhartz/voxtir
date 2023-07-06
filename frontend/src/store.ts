import { configureStore } from '@reduxjs/toolkit';
import track from './state/track';
import keyboard from './state/keyboard';
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
