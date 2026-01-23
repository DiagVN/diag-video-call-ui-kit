import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VideoCallUIKitV2',
      formats: ['es'],
      fileName: 'index'
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
        assetFileNames: 'styles/[name][extname]'
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: false
  }
})
