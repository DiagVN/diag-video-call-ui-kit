<template>
  <DiagCallShell
    :call-state="store.callState"
    :duration="store.stats.duration"
    :network-quality="localParticipant?.networkQuality"
    mode="grid"
  >
    <template #topbar>
      <DiagBanner
        v-if="store.isReconnecting"
        type="reconnecting"
        message-key="vc.banner.reconnecting"
      />
    </template>

    <DiagVideoGrid
      :participants="store.participants"
      :renderer="renderer"
      :show-network-quality="true"
    />

    <template #bottombar>
      <DiagCallControls
        :is-muted="store.isMuted"
        :is-video-off="store.isVideoOff"
        :is-screen-sharing="store.isScreenSharing"
        :participant-count="store.participantCount"
        @toggle-mic="store.toggleMic"
        @toggle-cam="store.toggleCam"
        @start-screen-share="store.startScreenShare"
        @stop-screen-share="store.stopScreenShare"
        @leave="handleLeave"
      />
    </template>
  </DiagCallShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoCallStore } from '@diag/video-call-core'
import {
  DiagCallShell,
  DiagVideoGrid,
  DiagCallControls,
  DiagBanner
} from '@diag/video-call-ui-kit'

const router = useRouter()
const store = useVideoCallStore()

// Mock renderer for demo (replace with actual Agora renderer in production)
const renderer = ref({
  attachVideo: (_el: HTMLElement, _participantId: string, _kind: 'camera' | 'screen') => {
    console.log('Attaching video:', _participantId, _kind)
    // In production, use AgoraVideoRenderer here
  },
  detachVideo: (_el: HTMLElement) => {
    console.log('Detaching video')
  }
})

const localParticipant = computed(() => 
  store.participants.find(p => p.isLocal)
)

async function handleLeave() {
  await store.leave()
  router.push('/')
}
</script>
