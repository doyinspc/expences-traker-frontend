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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // --- Core React ecosystem ---
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("scheduler")
            ) {
              return "vendor-react-core";
            }

            // --- State management (Redux, Redux Toolkit, React-Redux) ---
            if (id.includes("redux") || id.includes("@reduxjs") || id.includes("react-redux")) {
              return "vendor-redux";
            }

            // --- Data fetching (TanStack Query / React Query) ---
            if (id.includes("@tanstack") || id.includes("react-query")) {
              return "vendor-query";
            }

            // --- HTTP client (axios, etc.) ---
            if (id.includes("axios")) {
              return "vendor-http";
            }

            // --- Charting libraries (recharts, d3, victory, etc.) ---
            if (id.includes("recharts") || id.includes("d3") || id.includes("victory")) {
              return "vendor-charts";
            }

            // --- UI component libraries (Ant Design, MUI, etc.) ---
            if (id.includes("antd") || id.includes("@mui") || id.includes("@material-ui")) {
              return "vendor-ui";
            }

            // --- Date libraries (react-datepicker, date-fns, moment) ---
            if (id.includes("react-datepicker") || id.includes("date-fns") || id.includes("moment")) {
              return "vendor-date";
            }

            // --- Utility libraries (lodash, clsx, etc.) ---
            if (id.includes("lodash") || id.includes("clsx") || id.includes("classnames")) {
              return "vendor-utils";
            }

            // --- SweetAlert / modals ---
            if (id.includes("sweetalert")) {
              return "vendor-modal";
            }

            // --- Form handling (react-hook-form, formik, etc.) ---
            if (id.includes("react-hook-form") || id.includes("formik") || id.includes("yup")) {
              return "vendor-forms";
            }

            // --- Everything else (split by first-level package name if possible) ---
            // Get the package name from the path
            const match = id.match(/node_modules\/(?:@[^/]+\/)?([^/]+)/);
            if (match) {
              const pkgName = match[1];
              // Some packages might be large; you can group them further
              if (pkgName === "some-heavy-package") {
                return `vendor-${pkgName}`;
              }
              // For others, group by major categories or just use the package name
              return `vendor-${pkgName}`;
            }

            // Fallback (should rarely happen)
            return "vendor-other";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // keep at 500 KB
  },
});