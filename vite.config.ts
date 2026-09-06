import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        developer: resolve(__dirname, 'developer.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
