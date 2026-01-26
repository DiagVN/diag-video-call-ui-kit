import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.spec.ts']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VideoCallUIKitV2',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'vue-i18n', '@diagvn/video-call-core-v2'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'vue-i18n': 'VueI18n',
          '@diagvn/video-call-core-v2': 'VideoCallCoreV2'
        },
        assetFileNames: assetInfo => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || ''
        }
      }
    },
    cssCodeSplit: false
  }
})
