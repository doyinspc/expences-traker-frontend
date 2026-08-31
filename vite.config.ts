import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    // Ensure only one copy of React is used
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // --- React ecosystem (keep all together) ---
            if (
              id.includes("react") ||           // react, react-dom, react-is, etc.
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("scheduler") ||
              id.includes("use-sync-external-store") ||
              id.includes("object-assign") ||
              id.includes("prop-types")
            ) {
              return "vendor-react";
            }

            // --- Charting libraries (recharts, d3, etc.) ---
            if (id.includes("recharts") || id.includes("d3") || id.includes("victory")) {
              return "vendor-charts";
            }

            // --- UI libraries (Ant Design, MUI) ---
            if (id.includes("antd") || id.includes("@mui") || id.includes("@material-ui")) {
              return "vendor-ui";
            }

            // --- Date libraries (react-datepicker, date-fns, moment) ---
            if (id.includes("react-datepicker") || id.includes("date-fns") || id.includes("moment")) {
              return "vendor-date";
            }

            // --- Redux / state management ---
            if (id.includes("redux") || id.includes("@reduxjs") || id.includes("react-redux")) {
              return "vendor-redux";
            }

            // --- Data fetching (TanStack Query) ---
            if (id.includes("@tanstack") || id.includes("react-query")) {
              return "vendor-query";
            }

            // --- HTTP client ---
            if (id.includes("axios")) {
              return "vendor-http";
            }

            // --- Utilities (lodash, clsx, etc.) ---
            if (id.includes("lodash") || id.includes("clsx") || id.includes("classnames")) {
              return "vendor-utils";
            }

            // --- SweetAlert / modals ---
            if (id.includes("sweetalert")) {
              return "vendor-modal";
            }

            // --- Everything else (keep as one chunk to avoid ordering issues) ---
            return "vendor-other";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});