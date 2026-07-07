import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dexcom-api': {
        target: 'https://sandbox-api.dexcom.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dexcom-api/, ''),
      },
    },
  },
});
