import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

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
      name: 'DiagAgoraAdapterV2',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'agora-rtc-sdk-ng',
        'agora-rtm-sdk',
        '@diagvn/video-call-core-v2'
      ],
      output: {
        globals: {
          'agora-rtc-sdk-ng': 'AgoraRTC',
          'agora-rtm-sdk': 'AgoraRTM'
        }
      }
    }
  }
})
