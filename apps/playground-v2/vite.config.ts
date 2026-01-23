import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Resolve workspace packages to their source for development
      '@diagvn/video-call-core-v2': resolve(__dirname, '../../packages/core-v2/src/index.ts'),
      '@diagvn/video-call-ui-kit-v2': resolve(__dirname, '../../packages/ui-kit-v2/src/index.ts'),
      '@diagvn/agora-web-adapter-v2': resolve(__dirname, '../../packages/adapters/agora-web-v2/src/index.ts'),
    },
  },
  server: {
    port: 5174, // Different port from playground v1
    open: true,
  },
  optimizeDeps: {
    include: [
      'agora-rtc-sdk-ng',
      'agora-extension-virtual-background',
      'agora-extension-beauty-effect',
    ],
  },
});
