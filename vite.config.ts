import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// react-draggable (used by react-grid-layout) ships a browser bundle that reads
// process.env.DRAGGABLE_DEBUG; without these defines every drag throws
// "process is not defined" and widgets can't be moved.
const draggableDebugDefine = { 'process.env.DRAGGABLE_DEBUG': 'false' };

export default defineConfig({
  plugins: [react()],
  define: draggableDebugDefine,
  optimizeDeps: {
    esbuildOptions: { define: draggableDebugDefine },
  },
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
