import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3333,
    open: true, // Opens browser automatically
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
