<template>
  <div class="vc-video-grid" :class="`vc-video-grid--${layout}`">
    <DiagVideoTile
      v-for="participant in participants"
      :key="participant.id"
      :participant="participant"
      :renderer="renderer"
      :show-network-quality="showNetworkQuality"
      :show-role="showRole"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Participant } from '@diag/video-call-core'
import DiagVideoTile from './DiagVideoTile.vue'
import type { VideoRenderer } from './DiagVideoTile.vue'

export interface DiagVideoGridProps {
  /** Participants to display */
  participants: Participant[]
  /** Video renderer */
  renderer?: VideoRenderer
  /** Show network quality */
  showNetworkQuality?: boolean
  /** Show role badges */
  showRole?: boolean
  /** Maximum columns */
  maxColumns?: number
}

const props = withDefaults(defineProps<DiagVideoGridProps>(), {
  showNetworkQuality: true,
  showRole: false,
  maxColumns: 4
})

const layout = computed(() => {
  const count = props.participants.length
  if (count === 1) return 'single'
  if (count === 2) return 'dual'
  if (count <= 4) return 'quad'
  return 'grid'
})
</script>

<style scoped>
.vc-video-grid {
  display: grid;
  gap: var(--vc-space-sm);
  width: 100%;
  height: 100%;
  padding: var(--vc-space-sm);
}

.vc-video-grid--single {
  grid-template-columns: 1fr;
}

.vc-video-grid--dual {
  grid-template-columns: repeat(2, 1fr);
}

.vc-video-grid--quad {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.vc-video-grid--grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: minmax(200px, 1fr);
}

@media (max-width: 768px) {
  .vc-video-grid--dual,
  .vc-video-grid--quad,
  .vc-video-grid--grid {
    grid-template-columns: 1fr;
  }
}
</style>
