<template>
  <div class="vc-root vc-video-call" :class="rootClasses">
    <!-- Loading / Initializing -->
    <div v-if="store.isInitializing" class="vc-video-call__loading">
      <div class="vc-video-call__spinner"></div>
      <p>{{ $t('vc.state.initializing') }}</p>
    </div>

    <!-- Pre-join Screen -->
    <DiagPrejoinV2
      v-else-if="store.isPrejoin"
      :devices="store.devices"
      :renderer="store.renderer"
      :features="props.features"
      @join="handleJoin"
      @device-change="handleDeviceChange"
    >
      <template v-if="$slots.prejoin" #default>
        <slot name="prejoin" />
      </template>
    </DiagPrejoinV2>

    <!-- Waiting Room -->
    <DiagWaitingRoomV2
      v-else-if="store.isWaitingRoom"
      :status="store.waitingRoomState.status"
      :message="store.waitingRoomState.message"
      @leave="handleLeave"
    />

    <!-- Connecting -->
    <div v-else-if="store.isConnecting" class="vc-video-call__connecting">
      <div class="vc-video-call__spinner"></div>
      <p>{{ $t('vc.state.connecting') }}</p>
    </div>

    <!-- In Call -->
    <template v-else-if="store.isInCall">
      <DiagCallShellV2
        :mode="store.layoutConfig.mode"
        :call-state="store.callState"
        :duration="store.stats.duration"
        :network-quality="localNetworkQuality"
        :is-recording="store.isRecording"
        :is-live="store.isLive"
        :theme="props.theme"
        :show-status-bar="props.showStatusBar"
      >
        <!-- Top Bar -->
        <template #topbar>
          <slot name="topbar">
            <DiagTopBarV2
              v-if="props.showTopBar"
              :room-title="props.roomTitle"
              :participant-count="store.participantCount"
              :is-recording="store.isRecording"
              :recording-duration="store.recordingInfo.duration"
              :is-live="store.isLive"
              :viewer-count="store.liveStreamInfo.viewerCount"
              @toggle-participants="store.toggleParticipants"
              @toggle-settings="store.toggleSettings"
            />
          </slot>
        </template>

        <!-- Main Content -->
        <template #default>
          <slot>
            <DiagVideoGridV2
              :participants="gridParticipants"
              :layout="store.layoutConfig.mode"
              :pinned-id="store.pinnedParticipantId"
              :active-speaker-id="store.activeSpeakerId"
              :renderer="store.renderer"
              :show-network-quality="props.showNetworkQuality"
              @pin="store.pinParticipant"
            />
          </slot>
        </template>

        <!-- Bottom Bar (Controls) -->
        <template #bottombar>
          <slot name="controls">
            <DiagCallControlsV2
              :is-muted="store.isMuted"
              :is-video-off="store.isVideoOff"
              :is-screen-sharing="store.isScreenSharing"
              :is-recording="store.isRecording"
              :is-transcript-enabled="store.transcriptState.enabled"
              :is-chat-open="store.isChatOpen"
              :is-hand-raised="localParticipant?.isHandRaised"
              :unread-chat-count="store.unreadChatCount"
              :participant-count="store.participantCount"
              :features="props.features"
              :show-switch-camera="props.showSwitchCamera"
              @toggle-mic="store.toggleMic"
              @toggle-cam="store.toggleCam"
              @switch-camera="store.switchCamera"
              @toggle-screen-share="store.toggleScreenShare"
              @toggle-recording="handleToggleRecording"
              @toggle-transcript="handleToggleTranscript"
              @toggle-chat="store.toggleChat"
              @toggle-participants="store.toggleParticipants"
              @toggle-hand="store.toggleHandRaised"
              @toggle-more="store.toggleMoreMenu"
              @open-settings="store.openSettings()"
              @open-virtual-background="store.openSettings('background')"
              @open-beauty-effects="store.openSettings('beauty')"
              @leave="handleLeave"
            />
          </slot>
        </template>

        <!-- Sidebar -->
        <template v-if="showSidebar" #sidebar>
          <slot name="sidebar">
            <!-- Participants Panel -->
            <DiagParticipantsPanelV2
              v-if="store.isParticipantsOpen"
              :participants="visibleParticipants"
              :local-participant="localParticipant"
              :waiting-room-attendees="store.waitingRoomState.attendees"
              :is-host="store.isHost"
              :features="props.features"
              @close="store.toggleParticipants"
              @mute="handleMuteParticipant"
              @remove="store.removeParticipant"
              @admit="store.admitFromWaitingRoom"
              @reject="store.rejectFromWaitingRoom"
              @admit-all="store.admitAllFromWaitingRoom"
            />

            <!-- Chat Panel -->
            <DiagChatPanelV2
              v-else-if="store.isChatOpen"
              :messages="store.chatState.messages"
              :local-participant-id="localParticipant?.id"
              :disabled="!store.chatState.enabled"
              @close="store.closeChat"
              @send="store.sendChatMessage"
            />

            <!-- Settings Panel -->
            <DiagSettingsPanelV2
              v-else-if="store.isSettingsOpen"
              :devices="store.devices"
              :current-quality="store.currentVideoQuality"
              :virtual-background-enabled="store.virtualBackgroundEnabled"
              :virtual-background-config="store.virtualBackgroundConfig"
              :virtual-background-type="store.virtualBackgroundConfig?.type || null"
              :virtual-background-url="store.virtualBackgroundConfig?.imageUrl || ''"
              :beauty-effect-enabled="store.beautyEffectEnabled"
              :beauty-effect-options="store.beautyEffectOptions"
              :noise-suppression-level="store.noiseSuppressionLevel"
              :features="props.features"
              :initial-tab="store.settingsTab"
              :renderer="store.renderer"
              @close="store.toggleSettings"
              @device-change="handleDeviceChange"
              @change-video-quality="store.setVideoQuality"
              @change-virtual-background="handleVirtualBackgroundChange"
              @apply-virtual-background="handleApplyVirtualBackground"
              @change-beauty-enabled="handleBeautyEnabledChange"
              @change-beauty-option="store.setBeautyEffect"
              @change-noise-suppression="store.setNoiseSuppression"
            />
          </slot>
        </template>

        <!-- Overlays -->
        <template #overlays>
          <slot name="overlays">
            <!-- Toasts -->
            <DiagToastsV2
              :toasts="store.toasts"
              @dismiss="store.dismissToast"
            />

            <!-- Reconnecting Banner -->
            <DiagBannerV2
              v-if="store.isReconnecting"
              type="warn"
              :message-key="'vc.banner.reconnecting'"
              :dismissable="false"
            />

            <!-- Recording Indicator -->
            <DiagRecordingIndicatorV2
              v-if="store.isRecording && props.showRecordingIndicator"
              :duration="store.recordingInfo.duration"
            />

            <!-- Transcript Panel (floating) -->
            <DiagTranscriptPanelV2
              v-if="store.transcriptState.enabled && props.showTranscript"
              :entries="store.transcriptState.entries"
              :is-active="store.transcriptState.enabled"
              @close="store.stopTranscript"
              @stop="store.stopTranscript"
            />
          </slot>
        </template>
      </DiagCallShellV2>
    </template>

    <!-- Reconnecting State -->
    <div v-else-if="store.isReconnecting" class="vc-video-call__reconnecting">
      <div class="vc-video-call__spinner"></div>
      <p>{{ $t('vc.state.reconnecting') }}</p>
    </div>

    <!-- Ended -->
    <DiagCallEndedV2
      v-else-if="store.isEnded"
      :duration="store.stats.duration"
      @rejoin="emit('rejoin')"
    />

    <!-- Error -->
    <DiagCallErrorV2
      v-else-if="store.hasError"
      :errors="store.errors"
      @retry="emit('retry')"
      @dismiss="store.dismissError"
    />

    <!-- Language Selector Modal -->
    <DiagLanguageSelectorV2
      v-model="showLanguageSelector"
      :selected-language="selectedTranscriptLanguage"
      :is-first-time="!store.transcriptState.language || store.transcriptState.language === 'en-US'"
      :is-loading="isStartingTranscript"
      @confirm="handleLanguageConfirm"
      @cancel="handleLanguageCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, provide, ref } from 'vue'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import type { FeatureFlags, JoinOptions, DeviceSelection, RecordingConfig, VirtualBackgroundConfig } from '@diagvn/video-call-core-v2'

// Components
import DiagCallShellV2 from './DiagCallShellV2.vue'
import DiagPrejoinV2 from './DiagPrejoinV2.vue'
import DiagWaitingRoomV2 from './DiagWaitingRoomV2.vue'
import DiagVideoGridV2 from './DiagVideoGridV2.vue'
import DiagCallControlsV2 from './DiagCallControlsV2.vue'
import DiagTopBarV2 from './DiagTopBarV2.vue'
import DiagParticipantsPanelV2 from './DiagParticipantsPanelV2.vue'
import DiagChatPanelV2 from './DiagChatPanelV2.vue'
import DiagSettingsPanelV2 from './DiagSettingsPanelV2.vue'
import DiagToastsV2 from './DiagToastsV2.vue'
import DiagBannerV2 from './DiagBannerV2.vue'
import DiagTranscriptPanelV2 from './DiagTranscriptPanelV2.vue'
import DiagRecordingIndicatorV2 from './DiagRecordingIndicatorV2.vue'
import DiagCallEndedV2 from './DiagCallEndedV2.vue'
import DiagCallErrorV2 from './DiagCallErrorV2.vue'
import DiagLanguageSelectorV2 from './DiagLanguageSelectorV2.vue'

export interface DiagVideoCallV2Props {
  /** Theme */
  theme?: 'light' | 'dark'
  /** Room title */
  roomTitle?: string
  /** Feature flags */
  features?: Partial<FeatureFlags>
  /** Show top bar */
  showTopBar?: boolean
  /** Show status bar */
  showStatusBar?: boolean
  /** Show network quality indicators */
  showNetworkQuality?: boolean
  /** Show switch camera button (mobile) */
  showSwitchCamera?: boolean
  /** Show recording indicator */
  showRecordingIndicator?: boolean
  /** Show transcript panel */
  showTranscript?: boolean
  /** Auto-hide controls timeout (ms, 0 to disable) */
  autoHideControlsTimeout?: number
  /** Recording config */
  recordingConfig?: RecordingConfig
}

export interface DiagVideoCallV2Emits {
  (e: 'join', options: JoinOptions): void
  (e: 'leave'): void
  (e: 'rejoin'): void
  (e: 'retry'): void
  (e: 'error', error: Error): void
  /** Fired when transcript language is selected and transcript is starting */
  (e: 'transcript-language-selected', language: string): void
  /** Fired when transcript starts with the selected language */
  (e: 'transcript-started', language: string): void
  /** Fired when transcript stops */
  (e: 'transcript-stopped'): void
}

const props = withDefaults(defineProps<DiagVideoCallV2Props>(), {
  theme: 'light',
  roomTitle: '',
  showTopBar: true,
  showStatusBar: true,
  showNetworkQuality: true,
  showSwitchCamera: false,
  showRecordingIndicator: true,
  showTranscript: true,
  autoHideControlsTimeout: 0
})

const emit = defineEmits<DiagVideoCallV2Emits>()

const store = useVideoCallStoreV2()

// Provide store to child components
provide('videoCallStore', store)

// Language selector state
const showLanguageSelector = ref(false)
const isStartingTranscript = ref(false)
// Sync selected language with store's transcript language
const selectedTranscriptLanguage = computed({
  get: () => store.transcriptState.language || 'en-US',
  set: (value: string) => {
    // The actual state is managed through store actions
  }
})

// Computed
const rootClasses = computed(() => ({
  'vc-theme-dark': props.theme === 'dark',
  'vc-video-call--in-call': store.isInCall,
  'vc-video-call--fullscreen': store.isFullscreen
}))

const localParticipant = computed(() => store.localParticipant)

const localNetworkQuality = computed(() => 
  localParticipant.value?.networkQuality ?? 0
)

// Filter out STT bots and recording bots from participants list
const visibleParticipants = computed(() => 
  store.participants.filter(p => !p.isSTTBot && !p.isRecordingBot)
)

const gridParticipants = computed(() => {
  // Filter out STT bots and recording bots from the grid
  let filtered = visibleParticipants.value
  
  if (store.layoutConfig.hideVideoOff) {
    filtered = filtered.filter(p => p.videoEnabled || p.isLocal)
  }
  return filtered
})

const showSidebar = computed(() =>
  store.isParticipantsOpen || store.isChatOpen || store.isSettingsOpen
)

// Handlers
function handleJoin(options: Partial<JoinOptions>) {
  emit('join', options as JoinOptions)
}

function handleLeave() {
  store.leave()
  emit('leave')
}

function handleDeviceChange(selection: DeviceSelection) {
  store.setInputDevice(selection)
}

function handleToggleRecording() {
  store.toggleRecording(props.recordingConfig)
}

function handleMuteParticipant(uid: string, mediaType: 'audio' | 'video') {
  store.muteParticipant(uid, mediaType)
}

function handleVirtualBackgroundChange(config: Partial<VirtualBackgroundConfig>) {
  console.log('[DiagVideoCallV2] Virtual background change (preview):', config)
  store.setVirtualBackground(config as VirtualBackgroundConfig)
}

function handleApplyVirtualBackground() {
  console.log('[DiagVideoCallV2] Applying virtual background to main video')
  store.applyVirtualBackground()
}

function handleBeautyEnabledChange(enabled: boolean) {
  if (enabled) {
    store.setBeautyEffect(store.beautyEffectOptions || { enabled: true, smoothness: 50, lightening: 30, redness: 10, sharpness: 30 })
  } else {
    store.disableBeautyEffect()
  }
}

// Handle transcript toggle - show language selector for first time
function handleToggleTranscript() {
  if (store.transcriptState.enabled) {
    // Transcript is active, just stop it
    store.stopTranscript()
    emit('transcript-stopped')
  } else {
    // Transcript not active, show language selector first
    showLanguageSelector.value = true
  }
}

// Handle language selection confirm
async function handleLanguageConfirm(language: string) {
  isStartingTranscript.value = true
  
  // Emit the language selection event BEFORE starting transcript
  // This allows the client/backend to prepare the STT service with the correct language
  emit('transcript-language-selected', language)
  
  try {
    await store.startTranscript(language)
    showLanguageSelector.value = false
    // Emit transcript started event
    emit('transcript-started', language)
  } catch (error) {
    console.error('[DiagVideoCallV2] Failed to start transcript:', error)
    store.addToast({
      id: 'transcript-error',
      type: 'error',
      messageKey: 'vc.err.transcriptError',
      duration: 5000
    })
  } finally {
    isStartingTranscript.value = false
  }
}

// Handle language selector cancel
function handleLanguageCancel() {
  showLanguageSelector.value = false
}

// Auto-hide controls
let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null

function resetHideControlsTimer() {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  store.setShowControls(true)
  
  if (props.autoHideControlsTimeout > 0 && store.isInCall) {
    hideControlsTimeout = setTimeout(() => {
      store.setShowControls(false)
    }, props.autoHideControlsTimeout)
  }
}

// Watch for feature flags changes
watch(() => props.features, (newFeatures) => {
  if (newFeatures) {
    store.setFeatureFlags(newFeatures)
  }
}, { immediate: true, deep: true })

// Lifecycle
onMounted(() => {
  if (props.autoHideControlsTimeout > 0) {
    document.addEventListener('mousemove', resetHideControlsTimer)
    document.addEventListener('touchstart', resetHideControlsTimer)
  }
})

onUnmounted(() => {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  document.removeEventListener('mousemove', resetHideControlsTimer)
  document.removeEventListener('touchstart', resetHideControlsTimer)
})

// Expose store for parent access
defineExpose({
  store
})
</script>

<style scoped>
.vc-video-call {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--vc-bg);
  overflow: hidden;
}

.vc-video-call--fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--vc-z-modal);
}

.vc-video-call__loading,
.vc-video-call__connecting,
.vc-video-call__reconnecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--vc-space-lg);
  color: var(--vc-fg-muted);
}

.vc-video-call__spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--vc-border);
  border-top-color: var(--vc-primary);
  border-radius: 50%;
  animation: vc-spin 1s linear infinite;
}
</style>
