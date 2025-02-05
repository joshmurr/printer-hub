import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['iife'], // Immediately Invoked Function Expression
  platform: 'browser',
  bundle: true,
  clean: true,
  treeshake: false,
  publicDir: true,
  outDir: 'dist',
  globalName: 'printerHub', // Your functions will be available as MyLibrary.functionName
});
