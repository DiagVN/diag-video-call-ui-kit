import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiagAgoraWebAdapter',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['@diagvn/video-call-core', 'agora-rtc-sdk-ng'],
      output: {
        globals: {
          'agora-rtc-sdk-ng': 'AgoraRTC'
        }
      }
    }
  }
})
