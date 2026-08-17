import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './index';

const store = configureStore({
  reducer: rootReducer,
  // Customizing middleware to prevent development-mode lag
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Option A: Increase the threshold to 200ms (so the warning goes away)
      immutableCheck: { warnAfter: 200 }, 
      
      // Option B: If the lag is still bad, you can fully disable it:
      // immutableCheck: false,

      // Since you are handling school data with complex strings and dates, 
      // it's usually good to keep serializableCheck at 200ms too.
      serializableCheck: { warnAfter: 200 },
    }),
});

export default store;