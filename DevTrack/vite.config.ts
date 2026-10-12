import { defineConfig } from "vite";

// Use the standard Vite port when available, and allow Vite to select a fallback otherwise.
export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      input: {
        app: "index.html",
        portfolio: "portfolio.html",
      },
    },
  },
});
