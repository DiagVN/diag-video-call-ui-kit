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

    <!-- Transcript Panel -->
    <DiagTranscript
      v-if="showTranscript"
      class="transcript-panel"
      :entries="store.transcriptEntries"
      :is-live="store.isTranscriptEnabled"
      @close="showTranscript = false"
      @clear="store.clearTranscript"
    />

    <template #bottombar>
      <DiagCallControls
        :is-muted="store.isMuted"
        :is-video-off="store.isVideoOff"
        :is-screen-sharing="store.isScreenSharing"
        :is-transcript-enabled="store.isTranscriptEnabled"
        :participant-count="store.participantCount"
        @toggle-mic="store.toggleMic"
        @toggle-cam="handleToggleCam"
        @start-screen-share="store.startScreenShare"
        @stop-screen-share="store.stopScreenShare"
        @toggle-transcript="handleToggleTranscript"
        @toggle-more="showMoreMenu = !showMoreMenu"
        @leave="handleLeave"
      />
    </template>
  </DiagCallShell>

  <!-- More Options Menu -->
  <div v-if="showMoreMenu" class="more-menu-overlay" @click="showMoreMenu = false">
    <div class="more-menu" @click.stop>
      <button class="more-menu__item" @click="handleSettings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
        Settings
      </button>
      <button class="more-menu__item" @click="handleFullscreen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        Fullscreen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoCallStore } from '@diagvn/video-call-core'
import {
  DiagCallShell,
  DiagVideoGrid,
  DiagCallControls,
  DiagBanner,
  DiagTranscript
} from '@diagvn/video-call-ui-kit'
import { AgoraWebAdapter } from '@diagvn/agora-web-adapter'

const router = useRouter()
const store = useVideoCallStore()

const showMoreMenu = ref(false)
const showTranscript = ref(false)

// Create renderer from adapter if available
const renderer = computed(() => {
  const adapter = store.adapter as AgoraWebAdapter | null
  if (adapter && typeof adapter.createRenderer === 'function') {
    return adapter.createRenderer()
  }
  // Fallback mock renderer
  return {
    attachVideo: (_el: HTMLElement, participantId: string, kind: 'camera' | 'screen') => {
      console.log('Mock: Attaching video:', participantId, kind)
    },
    detachVideo: (el: HTMLElement) => {
      console.log('Mock: Detaching video')
      el.innerHTML = ''
    }
  }
})

const localParticipant = computed(() => 
  store.participants.find(p => p.isLocal)
)

// Show transcript panel when transcript is enabled
watch(() => store.isTranscriptEnabled, (enabled) => {
  if (enabled) {
    showTranscript.value = true
  }
})

async function handleToggleCam() {
  await store.toggleCam()
}

function handleToggleTranscript() {
  store.toggleTranscript('en-US')
  if (!store.isTranscriptEnabled) {
    showTranscript.value = true
  }
}

async function handleLeave() {
  // Stop transcript before leaving
  if (store.isTranscriptEnabled) {
    store.stopTranscript()
  }
  await store.leave()
  router.push('/')
}

function handleSettings() {
  showMoreMenu.value = false
  // TODO: Open settings modal
  console.log('Open settings')
}

function handleFullscreen() {
  showMoreMenu.value = false
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
</script>

<style scoped>
.transcript-panel {
  position: absolute;
  bottom: 100px;
  right: 20px;
  z-index: 100;
  width: 350px;
}

.more-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.more-menu {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vc-surface);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  box-shadow: var(--vc-shadow-lg);
  min-width: 200px;
  padding: 8px 0;
}

.more-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--vc-fg);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.more-menu__item:hover {
  background: var(--vc-bg);
}
</style>
