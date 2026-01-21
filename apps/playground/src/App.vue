<template>
  <div class="vc-root" :class="themeClass">
    <RouterView />
    <DiagToasts :toasts="store.toasts" @dismiss="store.dismissToast" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useVideoCallStore } from '@diag/video-call-core'
import { DiagToasts } from '@diag/video-call-ui-kit'

const store = useVideoCallStore()
const themeClass = ref('')

// Expose theme toggle for demo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).toggleTheme = () => {
  themeClass.value = themeClass.value === 'vc-theme-dark' ? '' : 'vc-theme-dark'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

#app {
  height: 100%;
}
</style>
