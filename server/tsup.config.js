import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.js"],
  format: ["cjs"],
  platform: "node",
  bundle: true,
  clean: true,
  minify: true,
  outDir: "dist",
  noExternal: [/.*/], // This tells Tsup to bundle everything
});
