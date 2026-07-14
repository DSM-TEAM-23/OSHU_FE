import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/OSHU_FE/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://3.216.152.235',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
