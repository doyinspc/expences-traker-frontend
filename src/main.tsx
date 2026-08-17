import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// In React Router v6, use react-router-dom for everything web-related
import 'core-js';

// Global Styles
import "./index.css";
import "flatpickr/dist/flatpickr.css";
// Modern Swiper imports (v7+)
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

// NOTE: If you exported store using "export const store", change this to: import { store } from './reducers/store'
import store from './reducers/store.js';

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
          <AppWrapper>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AppWrapper>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);