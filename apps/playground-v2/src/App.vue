<template>
  <div class="app">
    <RouterView />
    <DiagToastsV2 />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { DiagToastsV2 } from '@diagvn/video-call-ui-kit-v2';
</script>

<style>
.app {
  width: 100%;
  height: 100%;
}
</style>
