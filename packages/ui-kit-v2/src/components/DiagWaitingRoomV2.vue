<template>
  <div class="vc-waiting-room">
    <!-- Header -->
    <div class="vc-waiting-room__header">
      <div class="vc-waiting-room__logo">
        <slot name="logo">
          <VcIcon name="video-call" size="xl" class="vc-waiting-room__logo-icon" />
        </slot>
      </div>
      <h1 class="vc-waiting-room__title">{{ title }}</h1>
      <p v-if="subtitle" class="vc-waiting-room__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Content -->
    <div class="vc-waiting-room__content">
      <!-- Preview -->
      <div class="vc-waiting-room__preview">
        <div ref="videoPreviewRef" class="vc-waiting-room__video">
          <div v-if="!isVideoEnabled" class="vc-waiting-room__avatar">
            <div class="vc-waiting-room__avatar-circle">
              {{ avatarInitials }}
            </div>
          </div>
        </div>

        <!-- Device controls -->
        <div class="vc-waiting-room__controls">
          <button
            class="vc-waiting-room__control-btn"
            :class="{ 'vc-waiting-room__control-btn--muted': !isAudioEnabled }"
            @click="$emit('toggle-audio')"
          >
            <VcIcon :name="isAudioEnabled ? 'mic-on' : 'mic-off'" />
          </button>
          <button
            class="vc-waiting-room__control-btn"
            :class="{ 'vc-waiting-room__control-btn--muted': !isVideoEnabled }"
            @click="$emit('toggle-video')"
          >
            <VcIcon :name="isVideoEnabled ? 'camera-on' : 'camera-off'" />
          </button>
          <button
            class="vc-waiting-room__control-btn"
            @click="$emit('open-settings')"
          >
            <VcIcon name="settings" />
          </button>
        </div>
      </div>

      <!-- Status -->
      <div class="vc-waiting-room__status">
        <div v-if="status === 'waiting'" class="vc-waiting-room__status-waiting">
          <div class="vc-waiting-room__spinner" />
          <p class="vc-waiting-room__status-text">
            {{ $t('vc.status.waitingForHost') }}
          </p>
          <p class="vc-waiting-room__status-detail">
            {{ $t('vc.message.pleaseWait') }}
          </p>
        </div>

        <div v-else-if="status === 'denied'" class="vc-waiting-room__status-denied">
          <VcIcon name="blocked" size="lg" class="vc-waiting-room__status-icon" />
          <p class="vc-waiting-room__status-text">
            {{ $t('vc.status.accessDenied') }}
          </p>
          <p class="vc-waiting-room__status-detail">
            {{ denyReason || $t('vc.message.hostDenied') }}
          </p>
        </div>

        <div v-else-if="status === 'connecting'" class="vc-waiting-room__status-connecting">
          <div class="vc-waiting-room__spinner" />
          <p class="vc-waiting-room__status-text">
            {{ $t('vc.status.connecting') }}
          </p>
        </div>

        <div v-else class="vc-waiting-room__status-ready">
          <VcIcon name="success" size="lg" class="vc-waiting-room__status-icon" />
          <p class="vc-waiting-room__status-text">
            {{ $t('vc.status.readyToJoin') }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="vc-waiting-room__actions">
        <button
          v-if="status === 'denied'"
          class="vc-waiting-room__btn vc-waiting-room__btn--secondary"
          @click="$emit('request-again')"
        >
          {{ $t('vc.action.requestAgain') }}
        </button>
        
        <button
          class="vc-waiting-room__btn vc-waiting-room__btn--danger"
          @click="$emit('leave')"
        >
          {{ $t('vc.action.leaveQueue') }}
        </button>
      </div>

      <!-- Info -->
      <div v-if="showMeetingInfo" class="vc-waiting-room__info">
        <div v-if="meetingName" class="vc-waiting-room__info-item">
          <span class="vc-waiting-room__info-label">{{ $t('vc.label.meeting') }}:</span>
          <span class="vc-waiting-room__info-value">{{ meetingName }}</span>
        </div>
        <div v-if="participantsInCall > 0" class="vc-waiting-room__info-item">
          <span class="vc-waiting-room__info-label">{{ $t('vc.label.participants') }}:</span>
          <span class="vc-waiting-room__info-value">{{ participantsInCall }}</span>
        </div>
        <div v-if="waitPosition > 0" class="vc-waiting-room__info-item">
          <span class="vc-waiting-room__info-label">{{ $t('vc.label.position') }}:</span>
          <span class="vc-waiting-room__info-value">#{{ waitPosition }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="vc-waiting-room__footer">
      <slot name="footer">
        <p class="vc-waiting-room__footer-text">
          {{ $t('vc.message.waitingRoomNote') }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { VideoRenderer } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export type WaitingRoomStatus = 'waiting' | 'denied' | 'connecting' | 'ready'

export interface DiagWaitingRoomV2Props {
  status?: WaitingRoomStatus
  title?: string
  subtitle?: string
  userName?: string
  isAudioEnabled?: boolean
  isVideoEnabled?: boolean
  renderer?: VideoRenderer | null
  meetingName?: string
  participantsInCall?: number
  waitPosition?: number
  denyReason?: string
  showMeetingInfo?: boolean
}

export interface DiagWaitingRoomV2Emits {
  (e: 'toggle-audio'): void
  (e: 'toggle-video'): void
  (e: 'open-settings'): void
  (e: 'leave'): void
  (e: 'request-again'): void
}

const props = withDefaults(defineProps<DiagWaitingRoomV2Props>(), {
  status: 'waiting',
  title: 'Waiting Room',
  subtitle: '',
  userName: '',
  isAudioEnabled: false,
  isVideoEnabled: false,
  meetingName: '',
  participantsInCall: 0,
  waitPosition: 0,
  denyReason: '',
  showMeetingInfo: true
})

defineEmits<DiagWaitingRoomV2Emits>()

// Refs
const videoPreviewRef = ref<HTMLElement | null>(null)

// Computed
const avatarInitials = computed(() => {
  const name = props.userName || 'User'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Video rendering
watch(
  () => [videoPreviewRef.value, props.renderer, props.isVideoEnabled] as const,
  ([container, renderer, videoOn]) => {
    if (!container || !renderer) return

    if (videoOn) {
      renderer.attachPreview?.(container as HTMLElement, 'camera')
    } else {
      renderer.clearVideo?.(container as HTMLElement)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (videoPreviewRef.value && props.renderer) {
    props.renderer.clearVideo?.(videoPreviewRef.value)
  }
})
</script>

<style scoped>
.vc-waiting-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--vc-space-xl);
  background: linear-gradient(135deg, var(--vc-bg) 0%, var(--vc-bg-secondary) 100%);
}

/* Header */
.vc-waiting-room__header {
  text-align: center;
  margin-bottom: var(--vc-space-xl);
}

.vc-waiting-room__logo {
  margin-bottom: var(--vc-space-md);
}

.vc-waiting-room__logo-icon {
  font-size: 48px;
}

.vc-waiting-room__title {
  margin: 0 0 var(--vc-space-sm);
  font-size: var(--vc-text-2xl);
  font-weight: 700;
  color: var(--vc-text);
}

.vc-waiting-room__subtitle {
  margin: 0;
  font-size: var(--vc-text-md);
  color: var(--vc-text-secondary);
}

/* Content */
.vc-waiting-room__content {
  width: 100%;
  max-width: 480px;
}

/* Preview */
.vc-waiting-room__preview {
  position: relative;
  margin-bottom: var(--vc-space-lg);
}

.vc-waiting-room__video {
  aspect-ratio: 16 / 9;
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vc-waiting-room__video :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.vc-waiting-room__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.vc-waiting-room__avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--vc-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--vc-text-2xl);
  font-weight: 600;
}

.vc-waiting-room__controls {
  position: absolute;
  bottom: var(--vc-space-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--vc-space-sm);
}

.vc-waiting-room__control-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
  box-shadow: var(--vc-shadow-md);
}

.vc-waiting-room__control-btn:hover {
  transform: scale(1.1);
}

.vc-waiting-room__control-btn--muted {
  background: var(--vc-danger);
  color: white;
}

/* Status */
.vc-waiting-room__status {
  text-align: center;
  margin-bottom: var(--vc-space-lg);
  padding: var(--vc-space-lg);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-lg);
  border: 1px solid var(--vc-border);
}

.vc-waiting-room__status-waiting,
.vc-waiting-room__status-connecting,
.vc-waiting-room__status-denied,
.vc-waiting-room__status-ready {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--vc-space-sm);
}

.vc-waiting-room__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vc-border);
  border-top-color: var(--vc-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.vc-waiting-room__status-icon {
  font-size: 40px;
}

.vc-waiting-room__status-text {
  margin: 0;
  font-size: var(--vc-text-lg);
  font-weight: 600;
  color: var(--vc-text);
}

.vc-waiting-room__status-detail {
  margin: 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
}

.vc-waiting-room__status-denied .vc-waiting-room__status-text {
  color: var(--vc-danger);
}

/* Actions */
.vc-waiting-room__actions {
  display: flex;
  justify-content: center;
  gap: var(--vc-space-md);
  margin-bottom: var(--vc-space-lg);
}

.vc-waiting-room__btn {
  padding: var(--vc-space-sm) var(--vc-space-xl);
  border: none;
  border-radius: var(--vc-radius-md);
  font-size: var(--vc-text-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-waiting-room__btn--secondary {
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  border: 1px solid var(--vc-border);
}

.vc-waiting-room__btn--secondary:hover {
  background: var(--vc-bg-hover);
}

.vc-waiting-room__btn--danger {
  background: transparent;
  color: var(--vc-danger);
  border: 1px solid var(--vc-danger);
}

.vc-waiting-room__btn--danger:hover {
  background: var(--vc-danger);
  color: white;
}

/* Info */
.vc-waiting-room__info {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-md);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-md);
  border: 1px solid var(--vc-border);
}

.vc-waiting-room__info-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--vc-text-sm);
}

.vc-waiting-room__info-label {
  color: var(--vc-text-secondary);
}

.vc-waiting-room__info-value {
  font-weight: 500;
  color: var(--vc-text);
}

/* Footer */
.vc-waiting-room__footer {
  margin-top: var(--vc-space-xl);
  text-align: center;
}

.vc-waiting-room__footer-text {
  margin: 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
}
</style>
