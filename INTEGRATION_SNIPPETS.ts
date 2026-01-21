/**
 * DIAG Video Call UI Kit - Integration Snippets
 * 
 * Copy-paste ready code examples for common use cases
 */

// ============================================================================
// 1. BASIC SETUP (main.ts)
// ============================================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'
import '@diagvn/video-call-ui-kit/style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
const i18n = createI18n(createVideoCallI18n({}, 'vi')) // or 'en'

app.use(pinia).use(i18n).mount('#app')

// ============================================================================
// 2. SIMPLE PRE-JOIN + IN-CALL FLOW
// ============================================================================

// YourCallComponent.vue
/*
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVideoCallStore, createEventBus } from '@diagvn/video-call-core'
import {
  DiagPreJoinPanel,
  DiagCallShell,
  DiagVideoGrid,
  DiagCallControls
} from '@diagvn/video-call-ui-kit'
import { createAgoraAdapter, createAgoraRenderer } from '@diagvn/agora-web-adapter'

const store = useVideoCallStore()
const renderer = ref(null)

onMounted(async () => {
  // Initialize Agora adapter
  const eventBus = createEventBus()
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID,
    eventBus,
    debug: true
  })

  store.setAdapter(adapter)
  await store.init()

  // Create video renderer (optional: create after join)
  // renderer.value = createAgoraRenderer(client, localVideoTrack, screenTrack)
})

async function handleJoin(options: { joinMuted: boolean; joinVideoOff: boolean }) {
  try {
    await store.join({
      channel: 'my-channel-name',
      uid: Math.floor(Math.random() * 100000), // or get from server
      token: undefined, // or fetch from your token server
      joinMuted: options.joinMuted,
      joinVideoOff: options.joinVideoOff,
      displayName: 'John Doe'
    })
  } catch (error) {
    console.error('Join failed:', error)
  }
}
</script>

<template>
  <!-- Pre-Join Screen -->
  <DiagPreJoinPanel
    v-if="store.callState === 'prejoin'"
    :devices="store.devices"
    @join="handleJoin"
    @device-change="store.setInputDevice"
    @language-change="locale => $i18n.locale = locale"
  />

  <!-- In-Call Screen -->
  <DiagCallShell
    v-else-if="store.isInCall"
    :call-state="store.callState"
    :duration="store.stats.duration"
    :network-quality="store.localParticipant?.networkQuality"
    mode="grid"
  >
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
        @switch-camera="store.switchCamera"
        @start-screen-share="store.startScreenShare"
        @stop-screen-share="store.stopScreenShare"
        @leave="store.leave"
      />
    </template>
  </DiagCallShell>

  <!-- Reconnecting Banner -->
  <DiagBanner
    v-if="store.isReconnecting"
    type="reconnecting"
    message-key="vc.banner.reconnecting"
  />

  <!-- Toast Notifications -->
  <DiagToasts
    :toasts="store.toasts"
    @dismiss="store.dismissToast"
  />
</template>
*/

// ============================================================================
// 3. CUSTOM THEME
// ============================================================================

/*
// In your global CSS or component style:

:root {
  // Override DIAG blue with your brand color
  --vc-primary: #1E88E5;
  --vc-primary-strong: #1565C0;
  --vc-primary-deep: #0D47A1;

  // Customize border radius
  --vc-radius: 8px;

  // Customize shadows
  --vc-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

// Enable dark theme
.my-dark-mode {
  --vc-bg: #121212;
  --vc-surface: #1E1E1E;
  --vc-fg: #E0E0E0;
}
*/

// ============================================================================
// 4. CUSTOM i18n MESSAGES
// ============================================================================

/*
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'

const i18n = createI18n(
  createVideoCallI18n({
    vi: {
      vc: {
        custom: {
          companyName: 'DIAG Healthcare',
          welcomeMessage: 'Chào mừng đến với cuộc gọi video của DIAG'
        }
      }
    },
    en: {
      vc: {
        custom: {
          companyName: 'DIAG Healthcare',
          welcomeMessage: 'Welcome to DIAG video call'
        }
      }
    }
  })
)

// Use in template: {{ $t('vc.custom.welcomeMessage') }}
*/

// ============================================================================
// 5. TOKEN REFRESH (Server-Side)
// ============================================================================

/*
// Listen for token expiry events
import { useVideoCallStore } from '@diagvn/video-call-core'

const store = useVideoCallStore()

store.eventBus.on('token-will-expire', async ({ expiresIn }) => {
  console.log(`Token expires in ${expiresIn} seconds`)
  
  // Fetch new token from your server
  const response = await fetch('/api/rtc-token', {
    method: 'POST',
    body: JSON.stringify({ channel: 'my-channel', uid: store.localParticipant.id })
  })
  
  const { token } = await response.json()
  
  // Refresh token
  await store.refreshToken(token)
})

store.eventBus.on('token-expired', () => {
  // Handle expired token (e.g., show error, force rejoin)
  console.error('Token expired! Please rejoin.')
})
*/

// ============================================================================
// 6. CUSTOM VIDEO RENDERER (Advanced)
// ============================================================================

/*
import type { VideoRenderer } from '@diagvn/video-call-ui-kit'

// Create your own renderer if not using Agora
const customRenderer: VideoRenderer = {
  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen') {
    // Your custom logic to attach video stream to element
    // For example, using WebRTC MediaStream:
    const stream = getStreamForParticipant(participantId, kind)
    const video = document.createElement('video')
    video.srcObject = stream
    video.autoplay = true
    video.playsInline = true
    video.style.width = '100%'
    video.style.height = '100%'
    video.style.objectFit = 'cover'
    el.appendChild(video)
  },
  
  detachVideo(el: HTMLElement) {
    // Cleanup
    el.innerHTML = ''
  }
}

// Pass to DiagVideoTile
<DiagVideoTile :participant="p" :renderer="customRenderer" />
*/

// ============================================================================
// 7. MOCK ADAPTER (Testing without Agora)
// ============================================================================

/*
import type { Actions, AdapterConfig, JoinOptions } from '@diagvn/video-call-core'

class MockAdapter implements Actions {
  private eventBus: AdapterConfig['eventBus']

  constructor(config: AdapterConfig) {
    this.eventBus = config.eventBus
  }

  async init(): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'idle', to: 'prejoin' })
  }

  async join(options: JoinOptions): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'prejoin', to: 'connecting' })
    
    setTimeout(() => {
      this.eventBus.emit('call-state-changed', { from: 'connecting', to: 'in_call' })
      
      // Add local participant
      this.eventBus.emit('participant-joined', {
        id: String(options.uid),
        displayName: options.displayName || 'You',
        role: 'host',
        isLocal: true,
        audioEnabled: !options.joinMuted,
        videoEnabled: !options.joinVideoOff,
        isSpeaking: false,
        networkQuality: 4
      })
    }, 500)
  }

  async leave(): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'in_call', to: 'ended' })
  }

  // ... implement other methods
  async toggleMic(): Promise<boolean> { return true }
  async toggleCam(): Promise<boolean> { return true }
  // etc.
}

// Use mock adapter
const mockAdapter = new MockAdapter({ appId: 'mock', eventBus: createEventBus() })
store.setAdapter(mockAdapter)
*/

// ============================================================================
// 8. COMPOSABLE FOR CALL MANAGEMENT (Optional Pattern)
// ============================================================================

/*
// composables/useVideoCall.ts
import { ref, computed } from 'vue'
import { useVideoCallStore, createEventBus } from '@diagvn/video-call-core'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter'

export function useVideoCall() {
  const store = useVideoCallStore()
  const isInitialized = ref(false)

  async function initialize(appId: string) {
    if (isInitialized.value) return

    const eventBus = createEventBus()
    const adapter = createAgoraAdapter({ appId, eventBus, debug: true })

    store.setAdapter(adapter)
    await store.init()
    isInitialized.value = true
  }

  async function joinCall(channelName: string, userName: string) {
    await store.join({
      channel: channelName,
      uid: Math.floor(Math.random() * 100000),
      displayName: userName
    })
  }

  async function leaveCall() {
    await store.leave()
  }

  return {
    store,
    isInitialized,
    initialize,
    joinCall,
    leaveCall,
    // Computed shortcuts
    isInCall: computed(() => store.isInCall),
    participants: computed(() => store.participants),
    isMuted: computed(() => store.isMuted)
  }
}

// Usage:
// const { initialize, joinCall, isInCall } = useVideoCall()
// await initialize('YOUR_APP_ID')
// await joinCall('my-channel', 'John')
*/

// ============================================================================
// 9. ENVIRONMENT VARIABLES (.env.local)
// ============================================================================

/*
# Agora Configuration
VITE_AGORA_APP_ID=your_agora_app_id_here

# Token Server (optional, for production)
VITE_TOKEN_SERVER_URL=https://your-server.com/rtc-token

# Default Settings
VITE_DEFAULT_LANGUAGE=vi
VITE_DEFAULT_THEME=light

# Feature Flags
VITE_ENABLE_SCREEN_SHARE=true
VITE_ENABLE_RECORDING=true
*/

// ============================================================================
// 10. BUILD & DEPLOY
// ============================================================================

/*
// Build all packages
$ pnpm build

// Output:
// - packages/core/dist/         → ESM + CJS + types
// - packages/ui-kit/dist/        → ESM + CJS + types + style.css
// - packages/adapters/agora-web/dist/ → ESM + CJS + types

// Build demo app
$ pnpm build:playground

// Output:
// - apps/playground/dist/        → Static site (deploy to CDN)

// Run production preview
$ pnpm preview
*/

export {}
