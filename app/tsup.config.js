import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "iife"], // Added ESM for modern usage
  platform: "browser",
  bundle: true,
  clean: true,
  treeshake: true, // Enable treeshaking since we have modular code
  publicDir: true,
  outDir: "dist",
  globalName: "printerHub",
  minify: true, // Add minification
  sourcemap: true, // Add sourcemaps for debugging
  dts: true, // Generate declaration files
  esbuildOptions(options) {
    options.charset = "utf8"; // Important for handling printer control characters
  },
});
