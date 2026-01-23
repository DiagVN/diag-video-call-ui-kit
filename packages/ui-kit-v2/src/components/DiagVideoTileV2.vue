<template>
  <div
    class="vc-video-tile"
    :class="tileClasses"
    @click="handleClick"
    @dblclick="handleDoubleClick"
  >
    <!-- Video element -->
    <div ref="videoContainerRef" class="vc-video-tile__video">
      <!-- Placeholder when video off -->
      <div v-if="!isVideoEnabled" class="vc-video-tile__avatar">
        <div class="vc-video-tile__avatar-circle">
          {{ avatarInitials }}
        </div>
      </div>
    </div>

    <!-- Overlays -->
    <div class="vc-video-tile__overlays">
      <!-- Top bar -->
      <div class="vc-video-tile__top">
        <!-- Pin indicator -->
        <span v-if="isPinned" class="vc-video-tile__pin" :title="$t('vc.action.unpin')">
          <VcIcon name="pin" size="sm" />
        </span>

        <!-- Network quality -->
        <div v-if="showNetworkQuality && networkQuality > 0" class="vc-video-tile__network">
          <span
            v-for="bar in 5"
            :key="bar"
            class="vc-video-tile__network-bar"
            :class="{ 'vc-video-tile__network-bar--active': bar <= networkQuality }"
          />
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="vc-video-tile__bottom">
        <!-- Audio indicator -->
        <span class="vc-video-tile__audio" :class="audioClasses">
          <VcIcon :name="isAudioEnabled ? 'mic-on' : 'mic-off'" size="sm" />
        </span>

        <!-- Name -->
        <span class="vc-video-tile__name" :title="displayName">
          {{ displayName }}
          <span v-if="isLocal" class="vc-video-tile__local">({{ $t('vc.label.you') }})</span>
        </span>

        <!-- Role badge -->
        <span v-if="showRoleBadge" class="vc-video-tile__role">
          {{ roleBadgeText }}
        </span>
      </div>

      <!-- Audio level indicator -->
      <div v-if="isAudioEnabled && audioLevel > 0" class="vc-video-tile__audio-level">
        <div class="vc-video-tile__audio-level-bar" :style="audioLevelStyle" />
      </div>

      <!-- Actions (on hover) -->
      <div v-if="showActions" class="vc-video-tile__actions">
        <button
          v-if="!isPinned"
          class="vc-video-tile__action"
          :title="$t('vc.action.pin')"
          @click.stop="$emit('pin')"
        >
          <VcIcon name="pin" size="sm" />
        </button>
        <button
          v-else
          class="vc-video-tile__action"
          :title="$t('vc.action.unpin')"
          @click.stop="$emit('unpin')"
        >
          <VcIcon name="close" size="sm" />
        </button>
        <slot name="actions" />
      </div>

      <!-- Connection state overlay -->
      <div v-if="connectionStateOverlay" class="vc-video-tile__connection-overlay">
        {{ connectionStateOverlay }}
      </div>
    </div>

    <!-- Active speaker border -->
    <div v-if="isActiveSpeaker" class="vc-video-tile__speaker-border" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import VcIcon from './icons/VcIcon.vue'
import type { Participant, VideoRenderer } from '@diagvn/video-call-core-v2'

export type VideoKind = 'camera' | 'screen'

export interface DiagVideoTileV2Props {
  participant: Participant
  renderer?: VideoRenderer | null
  videoKind?: VideoKind
  isPinned?: boolean
  isActiveSpeaker?: boolean
  showNetworkQuality?: boolean
  showActions?: boolean
}

export interface DiagVideoTileV2Emits {
  (e: 'pin'): void
  (e: 'unpin'): void
  (e: 'click', participant: Participant): void
  (e: 'dblclick', participant: Participant): void
}

const props = withDefaults(defineProps<DiagVideoTileV2Props>(), {
  videoKind: 'camera',
  isPinned: false,
  isActiveSpeaker: false,
  showNetworkQuality: true,
  showActions: true
})

const emit = defineEmits<DiagVideoTileV2Emits>()

// Refs
const videoContainerRef = ref<HTMLElement | null>(null)

// Computed
const isLocal = computed(() => props.participant.isLocal)

const isVideoEnabled = computed(() => {
  if (props.videoKind === 'screen') {
    return props.participant.isScreenSharing
  }
  return props.participant.videoEnabled
})

const isAudioEnabled = computed(() => props.participant.audioEnabled)

const audioLevel = computed(() => props.participant.audioLevel ?? 0)

const networkQuality = computed(() => props.participant.networkQuality ?? 0)

const displayName = computed(() =>
  props.participant.name || props.participant.id.slice(0, 8)
)

const avatarInitials = computed(() => {
  const name = displayName.value
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const showRoleBadge = computed(() =>
  props.participant.role === 'host' || props.participant.isRecordingBot
)

const roleBadgeText = computed(() => {
  if (props.participant.isRecordingBot) return 'REC'
  if (props.participant.role === 'host') return 'Host'
  return ''
})

const connectionStateOverlay = computed(() => {
  const state = props.participant.connectionState
  if (state === 'connecting') return 'Connecting...'
  if (state === 'reconnecting') return 'Reconnecting...'
  if (state === 'disconnected') return 'Disconnected'
  return null
})

const tileClasses = computed(() => [
  `vc-video-tile--${props.videoKind}`,
  {
    'vc-video-tile--local': isLocal.value,
    'vc-video-tile--pinned': props.isPinned,
    'vc-video-tile--active-speaker': props.isActiveSpeaker,
    'vc-video-tile--video-off': !isVideoEnabled.value,
    'vc-video-tile--muted': !isAudioEnabled.value
  }
])

const audioClasses = computed(() => ({
  'vc-video-tile__audio--muted': !isAudioEnabled.value,
  'vc-video-tile__audio--speaking': audioLevel.value > 0.1
}))

const audioLevelStyle = computed(() => ({
  height: `${Math.min(audioLevel.value * 100, 100)}%`
}))

// Methods
function handleClick() {
  emit('click', props.participant)
}

function handleDoubleClick() {
  emit('dblclick', props.participant)
}

// Video rendering
watch(
  () => [videoContainerRef.value, props.renderer, props.participant.id, isVideoEnabled.value] as const,
  ([container, renderer, _uid, videoOn]) => {
    if (!container || !renderer) return

    if (videoOn) {
      // Render video
      if (props.videoKind === 'screen') {
        renderer.renderScreenShare?.(container as HTMLElement, props.participant.id)
      } else {
        renderer.renderVideo?.(container as HTMLElement, props.participant.id, isLocal.value)
      }
    } else {
      // Clear video
      renderer.clearVideo?.(container as HTMLElement)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (videoContainerRef.value && props.renderer) {
    props.renderer.clearVideo?.(videoContainerRef.value)
  }
})
</script>

<style scoped>
.vc-video-tile {
  position: relative;
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.vc-video-tile:hover {
  transform: scale(1.01);
}

.vc-video-tile:hover .vc-video-tile__actions {
  opacity: 1;
}

/* Video container */
.vc-video-tile__video {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vc-video-tile__video :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vc-video-tile--local .vc-video-tile__video :deep(video) {
  transform: scaleX(-1);
}

.vc-video-tile--screen .vc-video-tile__video :deep(video) {
  object-fit: contain;
  transform: none;
}

/* Avatar placeholder */
.vc-video-tile__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--vc-bg-secondary) 0%, var(--vc-bg) 100%);
}

.vc-video-tile__avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--vc-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--vc-text-xl);
  font-weight: 600;
}

/* Overlays */
.vc-video-tile__overlays {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--vc-space-sm);
  pointer-events: none;
}

.vc-video-tile__overlays > * {
  pointer-events: auto;
}

/* Top bar */
.vc-video-tile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vc-video-tile__pin {
  background: rgba(0, 0, 0, 0.5);
  padding: var(--vc-space-xs);
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
}

/* Network quality bars */
.vc-video-tile__network {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 3px 6px;
  border-radius: var(--vc-radius-sm);
}

.vc-video-tile__network-bar {
  width: 3px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.vc-video-tile__network-bar:nth-child(2) { height: 6px; }
.vc-video-tile__network-bar:nth-child(3) { height: 8px; }
.vc-video-tile__network-bar:nth-child(4) { height: 10px; }
.vc-video-tile__network-bar:nth-child(5) { height: 12px; }

.vc-video-tile__network-bar--active {
  background: var(--vc-success);
}

/* Bottom bar */
.vc-video-tile__bottom {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  margin: calc(-1 * var(--vc-space-sm));
  padding: var(--vc-space-md) var(--vc-space-sm) var(--vc-space-sm);
}

.vc-video-tile__audio {
  font-size: var(--vc-text-sm);
}

.vc-video-tile__audio--muted {
  color: var(--vc-danger);
}

.vc-video-tile__audio--speaking {
  animation: pulse 0.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.vc-video-tile__name {
  flex: 1;
  font-size: var(--vc-text-sm);
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vc-video-tile__local {
  opacity: 0.7;
  font-size: var(--vc-text-xs);
}

.vc-video-tile__role {
  font-size: var(--vc-text-xs);
  background: var(--vc-primary);
  color: white;
  padding: 2px 6px;
  border-radius: var(--vc-radius-sm);
}

/* Audio level indicator */
.vc-video-tile__audio-level {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 4px;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.vc-video-tile__audio-level-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--vc-success);
  transition: height 0.1s ease;
}

/* Actions overlay */
.vc-video-tile__actions {
  position: absolute;
  top: var(--vc-space-sm);
  right: var(--vc-space-sm);
  display: flex;
  gap: var(--vc-space-xs);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.vc-video-tile__action {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s ease;
}

.vc-video-tile__action:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Connection overlay */
.vc-video-tile__connection-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: var(--vc-text-sm);
}

/* Active speaker border */
.vc-video-tile__speaker-border {
  position: absolute;
  inset: 0;
  border: 3px solid var(--vc-success);
  border-radius: var(--vc-radius-md);
  pointer-events: none;
}

/* Pinned state */
.vc-video-tile--pinned {
  border: 2px solid var(--vc-primary);
}
</style>
