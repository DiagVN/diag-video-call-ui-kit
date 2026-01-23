import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiagAgoraAdapterV2',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.js'
    },
    rollupOptions: {
      external: [
        'agora-rtc-sdk-ng',
        'agora-rtm-sdk',
        '@diagvn/video-call-core-v2'
      ]
    },
    sourcemap: true,
    minify: false
  }
})
