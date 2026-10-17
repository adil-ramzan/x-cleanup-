import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two HTML entry points: the toolbar popup and the full-page dashboard.
// public/ (manifest.json, icons) is copied verbatim into dist/.
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so pages resolve correctly under chrome-extension://<id>/
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
      output: {
        // Neutral names for code/styles shared by both entry points.
        chunkFileNames: 'assets/shared-[hash].js',
        assetFileNames: (asset) =>
          asset.name?.endsWith('.css') ? 'assets/styles-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
