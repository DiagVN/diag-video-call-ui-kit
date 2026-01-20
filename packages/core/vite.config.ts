import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiagVideoCallCore',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'mitt'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      }
    }
  }
})
