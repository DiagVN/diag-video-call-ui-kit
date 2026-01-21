import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.spec.ts']
    })
  ],
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
