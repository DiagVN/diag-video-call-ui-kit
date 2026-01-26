<template>
  <div class="vc-controls" :class="controlsClasses">
    <!-- Left section -->
    <div class="vc-controls__section vc-controls__section--left">
      <slot name="left" />
    </div>

    <!-- Center section (main controls) -->
    <div class="vc-controls__section vc-controls__section--center">
      <!-- Audio toggle -->
      <button
        v-if="features.audioToggle !== false"
        class="vc-controls__btn"
        :class="{ 'vc-controls__btn--muted': !isAudioEnabled }"
        :title="isAudioEnabled ? $t('vc.action.mute') : $t('vc.action.unmute')"
        @click="$emit('toggle-audio')"
      >
        <VcIcon :name="isAudioEnabled ? 'mic-on' : 'mic-off'" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">
          {{ isAudioEnabled ? $t('vc.action.mute') : $t('vc.action.unmute') }}
        </span>
      </button>

      <!-- Video toggle -->
      <button
        v-if="features.videoToggle !== false"
        class="vc-controls__btn"
        :class="{ 'vc-controls__btn--muted': !isVideoEnabled }"
        :title="isVideoEnabled ? $t('vc.action.stopVideo') : $t('vc.action.startVideo')"
        @click="$emit('toggle-video')"
      >
        <VcIcon :name="isVideoEnabled ? 'camera-on' : 'camera-off'" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">
          {{ isVideoEnabled ? $t('vc.action.stopVideo') : $t('vc.action.startVideo') }}
        </span>
      </button>

      <!-- Screen share -->
      <button
        v-if="features.screenShare"
        class="vc-controls__btn"
        :class="{ 'vc-controls__btn--active': isScreenSharing }"
        :title="isScreenSharing ? $t('vc.action.stopShare') : $t('vc.action.shareScreen')"
        @click="$emit('toggle-screen-share')"
      >
        <VcIcon name="screen-share" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">
          {{ isScreenSharing ? $t('vc.action.stopShare') : $t('vc.action.shareScreen') }}
        </span>
      </button>

      <!-- Chat toggle -->
      <button
        v-if="features.chat"
        class="vc-controls__btn"
        :class="{ 'vc-controls__btn--active': isChatOpen }"
        :title="$t('vc.action.chat')"
        @click="$emit('toggle-chat')"
      >
        <VcIcon name="chat" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">{{ $t('vc.action.chat') }}</span>
        <span v-if="unreadMessages > 0" class="vc-controls__badge">{{ unreadMessages }}</span>
      </button>

      <!-- Participants toggle -->
      <button
        v-if="features.participantsList"
        class="vc-controls__btn"
        :class="{ 'vc-controls__btn--active': isParticipantsOpen }"
        :title="$t('vc.action.participants')"
        @click="$emit('toggle-participants')"
      >
        <VcIcon name="participants" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">{{ participantCount }}</span>
      </button>

      <!-- More options dropdown -->
      <div v-if="hasMoreOptions" class="vc-controls__dropdown">
        <button
          class="vc-controls__btn"
          :class="{ 'vc-controls__btn--active': isMoreOpen }"
          :title="$t('vc.action.more')"
          @click="isMoreOpen = !isMoreOpen"
        >
          <VcIcon name="more" class="vc-controls__icon" />
        </button>

        <div v-if="isMoreOpen" class="vc-controls__dropdown-menu" @click="isMoreOpen = false">
          <!-- Recording -->
          <button
            v-if="features.recording"
            class="vc-controls__menu-item"
            :class="{ 'vc-controls__menu-item--active': isRecording }"
            @click="$emit('toggle-recording')"
          >
            <VcIcon name="recording" size="sm" />
            {{ isRecording ? $t('vc.action.stopRecording') : $t('vc.action.startRecording') }}
          </button>

          <!-- Live stream -->
          <button
            v-if="features.liveStream"
            class="vc-controls__menu-item"
            :class="{ 'vc-controls__menu-item--active': isLiveStreaming }"
            @click="$emit('toggle-live-stream')"
          >
            <VcIcon name="screen-share" size="sm" />
            {{ isLiveStreaming ? $t('vc.action.stopStream') : $t('vc.action.startStream') }}
          </button>

          <!-- Virtual background -->
          <button
            v-if="features.virtualBackground"
            class="vc-controls__menu-item"
            @click="$emit('open-virtual-background')"
          >
            <VcIcon name="video-call" size="sm" />
            {{ $t('vc.action.virtualBackground') }}
          </button>

          <!-- Beauty effects -->
          <button
            v-if="features.beautyEffects"
            class="vc-controls__menu-item"
            @click="$emit('open-beauty-effects')"
          >
            <VcIcon name="settings" size="sm" />
            {{ $t('vc.action.beautyEffects') }}
          </button>

          <!-- Noise suppression -->
          <button
            v-if="features.noiseSuppression"
            class="vc-controls__menu-item"
            :class="{ 'vc-controls__menu-item--active': isNoiseSuppressionEnabled }"
            @click="$emit('toggle-noise-suppression')"
          >
            <VcIcon name="mic-on" size="sm" />
            {{ $t('vc.action.noiseSuppression') }}
          </button>

          <!-- Settings -->
          <button
            class="vc-controls__menu-item"
            @click="$emit('open-settings')"
          >
            <VcIcon name="settings" size="sm" />
            {{ $t('vc.action.settings') }}
          </button>

          <slot name="more-options" />
        </div>
      </div>

      <!-- End call -->
      <button
        class="vc-controls__btn vc-controls__btn--danger"
        :title="$t('vc.action.leave')"
        @click="$emit('leave')"
      >
        <VcIcon name="leave-call" class="vc-controls__icon" />
        <span v-if="showLabels" class="vc-controls__label">{{ $t('vc.action.leave') }}</span>
      </button>
    </div>

    <!-- Right section -->
    <div class="vc-controls__section vc-controls__section--right">
      <!-- Layout toggle -->
      <button
        v-if="features.layoutToggle"
        class="vc-controls__btn vc-controls__btn--secondary"
        :title="$t('vc.action.layout')"
        @click="$emit('toggle-layout')"
      >
        <VcIcon name="video-call" class="vc-controls__icon" />
      </button>

      <!-- Fullscreen -->
      <button
        v-if="features.fullscreen"
        class="vc-controls__btn vc-controls__btn--secondary"
        :title="isFullscreen ? $t('vc.action.exitFullscreen') : $t('vc.action.fullscreen')"
        @click="$emit('toggle-fullscreen')"
      >
        <VcIcon :name="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" class="vc-controls__icon" />
      </button>

      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FeatureFlags, LayoutMode } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface DiagCallControlsV2Props {
  isAudioEnabled?: boolean
  isVideoEnabled?: boolean
  isScreenSharing?: boolean
  isRecording?: boolean
  isLiveStreaming?: boolean
  isNoiseSuppressionEnabled?: boolean
  isChatOpen?: boolean
  isParticipantsOpen?: boolean
  isFullscreen?: boolean
  layout?: LayoutMode
  participantCount?: number
  unreadMessages?: number
  features?: Partial<FeatureFlags>
  showLabels?: boolean
  position?: 'bottom' | 'top' | 'floating'
}

export interface DiagCallControlsV2Emits {
  (e: 'toggle-audio'): void
  (e: 'toggle-video'): void
  (e: 'toggle-screen-share'): void
  (e: 'toggle-chat'): void
  (e: 'toggle-participants'): void
  (e: 'toggle-recording'): void
  (e: 'toggle-live-stream'): void
  (e: 'toggle-noise-suppression'): void
  (e: 'toggle-layout'): void
  (e: 'toggle-fullscreen'): void
  (e: 'open-settings'): void
  (e: 'open-virtual-background'): void
  (e: 'open-beauty-effects'): void
  (e: 'leave'): void
}

const props = withDefaults(defineProps<DiagCallControlsV2Props>(), {
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  isRecording: false,
  isLiveStreaming: false,
  isNoiseSuppressionEnabled: false,
  isChatOpen: false,
  isParticipantsOpen: false,
  isFullscreen: false,
  layout: 'grid',
  participantCount: 0,
  unreadMessages: 0,
  features: () => ({
    audioToggle: true,
    videoToggle: true,
    screenShare: true,
    chat: true,
    participantsList: true,
    recording: false,
    liveStream: false,
    virtualBackground: false,
    beautyEffects: false,
    noiseSuppression: false,
    layoutToggle: true,
    fullscreen: true
  }),
  showLabels: false,
  position: 'bottom'
})

defineEmits<DiagCallControlsV2Emits>()

// State
const isMoreOpen = ref(false)

// Computed
const controlsClasses = computed(() => [
  `vc-controls--${props.position}`
])

const hasMoreOptions = computed(() =>
  props.features.recording ||
  props.features.liveStream ||
  props.features.virtualBackground ||
  props.features.beautyEffects ||
  props.features.noiseSuppression
)

const layoutIcon = computed(() => {
  switch (props.layout) {
    case 'grid': return '▦'
    case 'speaker': return '◧'
    case 'spotlight': return '◱'
    case 'side-by-side': return '◫'
    case 'pip': return '◳'
    default: return '▦'
  }
})
</script>

<style scoped>
.vc-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-md);
  background: var(--vc-bg-secondary);
  gap: var(--vc-space-md);
}

.vc-controls--bottom {
  border-radius: var(--vc-radius-lg) var(--vc-radius-lg) 0 0;
}

.vc-controls--top {
  border-radius: 0 0 var(--vc-radius-lg) var(--vc-radius-lg);
}

.vc-controls--floating {
  position: fixed;
  bottom: var(--vc-space-lg);
  left: 50%;
  transform: translateX(-50%);
  border-radius: var(--vc-radius-lg);
  box-shadow: var(--vc-shadow-lg);
  background: rgba(var(--vc-bg-secondary-rgb, 30, 30, 30), 0.95);
  backdrop-filter: blur(8px);
}

/* Sections */
.vc-controls__section {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
}

.vc-controls__section--left {
  flex: 1;
}

.vc-controls__section--center {
  display: flex;
  gap: var(--vc-space-sm);
}

.vc-controls__section--right {
  flex: 1;
  justify-content: flex-end;
}

/* Button styles */
.vc-controls__btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--vc-space-xs);
  min-width: 48px;
  height: 48px;
  padding: var(--vc-space-sm);
  border: none;
  border-radius: var(--vc-radius-md);
  background: var(--vc-bg);
  color: var(--vc-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-controls__btn:hover:not(:disabled) {
  background: var(--vc-bg-hover);
  transform: translateY(-2px);
}

.vc-controls__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vc-controls__btn--muted {
  background: var(--vc-danger);
  color: white;
}

.vc-controls__btn--active {
  background: var(--vc-primary);
  color: white;
}

.vc-controls__btn--danger {
  background: var(--vc-danger);
  color: white;
}

.vc-controls__btn--danger:hover {
  background: var(--vc-danger-dark, #c0392b);
}

.vc-controls__btn--secondary {
  background: transparent;
  border: 1px solid var(--vc-border);
}

/* Icon and label */
.vc-controls__icon {
  font-size: 20px;
  line-height: 1;
}

.vc-controls__label {
  font-size: var(--vc-text-xs);
  white-space: nowrap;
}

/* Badge */
.vc-controls__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--vc-danger);
  color: white;
  border-radius: 9px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dropdown */
.vc-controls__dropdown {
  position: relative;
}

.vc-controls__dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--vc-space-sm);
  min-width: 200px;
  background: var(--vc-bg);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  box-shadow: var(--vc-shadow-lg);
  overflow: hidden;
  z-index: 100;
}

.vc-controls__menu-item {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  width: 100%;
  padding: var(--vc-space-sm) var(--vc-space-md);
  border: none;
  background: transparent;
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.vc-controls__menu-item:hover {
  background: var(--vc-bg-hover);
}

.vc-controls__menu-item--active {
  background: var(--vc-primary-light);
  color: var(--vc-primary);
}

/* Mobile */
@media (max-width: 768px) {
  .vc-controls {
    padding: var(--vc-space-sm);
  }

  .vc-controls__btn {
    min-width: 40px;
    height: 40px;
    padding: var(--vc-space-xs);
  }

  .vc-controls__icon {
    font-size: 18px;
  }

  .vc-controls__label {
    display: none;
  }

  .vc-controls__section--left,
  .vc-controls__section--right {
    display: none;
  }

  .vc-controls--floating {
    width: calc(100% - var(--vc-space-lg) * 2);
  }
}
</style>
