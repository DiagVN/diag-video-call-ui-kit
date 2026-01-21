import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@diagvn/video-call-core': fileURLToPath(new URL('./packages/core/src', import.meta.url)),
      '@diagvn/video-call-ui-kit': fileURLToPath(
        new URL('./packages/ui-kit/src', import.meta.url)
      ),
      '@diagvn/agora-web-adapter': fileURLToPath(
        new URL('./packages/adapters/agora-web/src', import.meta.url)
      )
    }
  }
})
