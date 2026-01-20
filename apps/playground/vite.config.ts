import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@diag/video-call-core': fileURLToPath(
        new URL('../../packages/core/src', import.meta.url)
      ),
      '@diag/video-call-ui-kit': fileURLToPath(
        new URL('../../packages/ui-kit/src', import.meta.url)
      ),
      '@diag/agora-web-adapter': fileURLToPath(
        new URL('../../packages/adapters/agora-web/src', import.meta.url)
      )
    }
  },
  server: {
    port: 5173
  }
})
