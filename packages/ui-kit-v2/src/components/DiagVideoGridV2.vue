<template>
  <div class="vc-video-grid" :class="gridClasses">
    <!-- Screen Share (if active) -->
    <div v-if="screenSharingParticipant" class="vc-video-grid__screen-share">
      <DiagVideoTileV2
        :participant="screenSharingParticipant"
        :renderer="renderer"
        video-kind="screen"
        :show-network-quality="false"
        class="vc-video-grid__screen-tile"
      />
    </div>

    <!-- Video Tiles -->
    <div class="vc-video-grid__tiles" :class="tilesClasses">
      <DiagVideoTileV2
        v-for="participant in displayedParticipants"
        :key="participant.id"
        :participant="participant"
        :renderer="renderer"
        :is-pinned="pinnedId === participant.id"
        :is-active-speaker="activeSpeakerId === participant.id"
        :show-network-quality="showNetworkQuality"
        @pin="$emit('pin', participant.id)"
        @unpin="$emit('pin', null)"
      />
    </div>

    <!-- Overflow indicator -->
    <div v-if="overflowCount > 0" class="vc-video-grid__overflow">
      +{{ overflowCount }} {{ $t('vc.label.more') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Participant, LayoutMode, VideoRenderer } from '@diagvn/video-call-core-v2'
import DiagVideoTileV2 from './DiagVideoTileV2.vue'

export interface DiagVideoGridV2Props {
  participants: readonly Participant[]
  layout?: LayoutMode
  pinnedId?: string | null
  activeSpeakerId?: string | null
  renderer?: VideoRenderer | null
  showNetworkQuality?: boolean
  maxVisible?: number
}

export interface DiagVideoGridV2Emits {
  (e: 'pin', uid: string | null): void
}

const props = withDefaults(defineProps<DiagVideoGridV2Props>(), {
  layout: 'grid',
  showNetworkQuality: true,
  maxVisible: 9
})

defineEmits<DiagVideoGridV2Emits>()

// Computed
const screenSharingParticipant = computed(() =>
  props.participants.find(p => p.isScreenSharing)
)

const nonScreenShareParticipants = computed(() =>
  props.participants.filter(p => !p.isScreenSharing || p.isLocal)
)

const displayedParticipants = computed(() => {
  let list = nonScreenShareParticipants.value

  // If pinned, put pinned first
  if (props.pinnedId) {
    const pinned = list.find(p => p.id === props.pinnedId)
    if (pinned) {
      list = [pinned, ...list.filter(p => p.id !== props.pinnedId)]
    }
  }

  // Limit visible
  return list.slice(0, props.maxVisible)
})

const overflowCount = computed(() => {
  const total = nonScreenShareParticipants.value.length
  return Math.max(0, total - props.maxVisible)
})

const gridClasses = computed(() => [
  `vc-video-grid--${props.layout}`,
  {
    'vc-video-grid--with-screen-share': !!screenSharingParticipant.value,
    'vc-video-grid--single': displayedParticipants.value.length === 1,
    'vc-video-grid--dual': displayedParticipants.value.length === 2
  }
])

const tilesClasses = computed(() => {
  const count = displayedParticipants.value.length
  if (count === 1) return 'vc-video-grid__tiles--1'
  if (count === 2) return 'vc-video-grid__tiles--2'
  if (count <= 4) return 'vc-video-grid__tiles--4'
  if (count <= 6) return 'vc-video-grid__tiles--6'
  return 'vc-video-grid__tiles--many'
})
</script>

<style scoped>
.vc-video-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--vc-space-sm);
  gap: var(--vc-space-sm);
  background: var(--vc-bg);
}

/* Screen share layout */
.vc-video-grid--with-screen-share {
  flex-direction: row;
}

.vc-video-grid__screen-share {
  flex: 3;
  min-width: 0;
}

.vc-video-grid__screen-tile {
  width: 100%;
  height: 100%;
}

.vc-video-grid--with-screen-share .vc-video-grid__tiles {
  flex: 1;
  flex-direction: column;
  max-width: 280px;
  overflow-y: auto;
}

/* Tiles container */
.vc-video-grid__tiles {
  display: grid;
  gap: var(--vc-space-sm);
  width: 100%;
  height: 100%;
}

/* Grid layouts */
.vc-video-grid__tiles--1 {
  grid-template-columns: 1fr;
}

.vc-video-grid__tiles--2 {
  grid-template-columns: repeat(2, 1fr);
}

.vc-video-grid__tiles--4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.vc-video-grid__tiles--6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.vc-video-grid__tiles--many {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-auto-rows: minmax(180px, 1fr);
}

/* Speaker layout */
.vc-video-grid--speaker .vc-video-grid__tiles {
  grid-template-columns: 1fr;
  grid-template-rows: 3fr 1fr;
}

.vc-video-grid--speaker .vc-video-grid__tiles > :first-child {
  grid-column: 1;
  grid-row: 1;
}

.vc-video-grid--speaker .vc-video-grid__tiles > :not(:first-child) {
  grid-row: 2;
}

/* Spotlight layout */
.vc-video-grid--spotlight .vc-video-grid__tiles--many {
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr;
}

/* Overflow indicator */
.vc-video-grid__overflow {
  position: absolute;
  bottom: var(--vc-space-lg);
  right: var(--vc-space-lg);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-sm);
}

/* Mobile */
@media (max-width: 768px) {
  .vc-video-grid--with-screen-share {
    flex-direction: column;
  }

  .vc-video-grid--with-screen-share .vc-video-grid__tiles {
    max-width: none;
    flex-direction: row;
    max-height: 120px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .vc-video-grid__tiles--2,
  .vc-video-grid__tiles--4,
  .vc-video-grid__tiles--6,
  .vc-video-grid__tiles--many {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(150px, 1fr);
  }
}
</style>
