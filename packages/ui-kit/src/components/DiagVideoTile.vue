<template>
  <div class="vc-video-tile" :class="tileClass">
    <!-- Video Element Mount Point -->
    <div ref="videoMountRef" class="vc-video-tile__video"></div>

    <!-- Avatar Fallback (when video is off) -->
    <div v-if="!participant.videoEnabled" class="vc-video-tile__avatar">
      <img
        v-if="participant.avatarUrl"
        :src="participant.avatarUrl"
        :alt="participant.displayName"
        class="vc-video-tile__avatar-img"
      />
      <div v-else class="vc-video-tile__avatar-initials">
        {{ initials }}
      </div>
    </div>

    <!-- Speaking Ring -->
    <div v-if="participant.isSpeaking" class="vc-video-tile__speaking-ring"></div>

    <!-- Overlay Info -->
    <div class="vc-video-tile__overlay">
      <!-- Top Bar -->
      <div class="vc-video-tile__top">
        <!-- Network Quality -->
        <div v-if="showNetworkQuality" class="vc-video-tile__network">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            :class="`vc-video-tile__network-icon--${networkQualityLevel}`"
          >
            <path
              :opacity="participant.networkQuality >= 1 ? 1 : 0.3"
              d="M2 13h2v2H2v-2zm4-4h2v6H6V9zm4-4h2v10h-2V5zm4-4h2v14h-2V1z"
            />
          </svg>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="vc-video-tile__bottom">
        <!-- Name & Role -->
        <div class="vc-video-tile__info">
          <span class="vc-video-tile__name">
            {{ displayName }}
            <span v-if="participant.isLocal" class="vc-video-tile__you">{{
              $t('vc.label.you')
            }}</span>
          </span>
          <span v-if="showRole" class="vc-video-tile__role vc-badge vc-badge-primary">
            {{ $t(`vc.label.${participant.role}`) }}
          </span>
        </div>

        <!-- Status Icons -->
        <div class="vc-video-tile__status">
          <!-- Microphone Status -->
          <div
            v-if="!participant.audioEnabled"
            class="vc-video-tile__icon"
            :title="$t('vc.label.muted')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V20h2v-2.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
              />
            </svg>
          </div>

          <!-- Screen Sharing Indicator -->
          <div
            v-if="participant.isScreenSharing"
            class="vc-video-tile__icon vc-video-tile__icon--screen"
            :title="$t('vc.label.screenSharing')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import type { Participant } from '@diagvn/video-call-core'

export interface VideoRenderer {
  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen'): void
  detachVideo(el: HTMLElement): void
}

export interface DiagVideoTileProps {
  /** Participant data */
  participant: Participant
  /** Video renderer */
  renderer?: VideoRenderer
  /** Show network quality indicator */
  showNetworkQuality?: boolean
  /** Show role badge */
  showRole?: boolean
  /** Video kind */
  videoKind?: 'camera' | 'screen'
}

const props = withDefaults(defineProps<DiagVideoTileProps>(), {
  showNetworkQuality: true,
  showRole: false,
  videoKind: 'camera'
})

const videoMountRef = ref<HTMLDivElement>()

const displayName = computed(() => props.participant.displayName || 'Unknown')

const initials = computed(() => {
  const name = displayName.value
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const tileClass = computed(() => ({
  'vc-video-tile--local': props.participant.isLocal,
  'vc-video-tile--speaking': props.participant.isSpeaking,
  'vc-video-tile--video-off': !props.participant.videoEnabled
}))

const networkQualityLevel = computed(() => {
  const q = props.participant.networkQuality
  if (q >= 4) return 'excellent'
  if (q === 3) return 'good'
  if (q === 2) return 'fair'
  if (q === 1) return 'poor'
  return 'veryPoor'
})

// Track if video is already attached to prevent duplicate calls
let isAttached = false
let retryTimeout: ReturnType<typeof setTimeout> | null = null

// Attach/detach video when renderer or participant changes
watch(
  () => [props.renderer, props.participant.id, props.participant.videoEnabled],
  async ([, , videoEnabled]) => {
    // Clear any pending retry
    if (retryTimeout) {
      clearTimeout(retryTimeout)
      retryTimeout = null
    }
    
    // Wait for next tick to ensure DOM is ready
    await nextTick()
    
    if (videoMountRef.value && props.renderer) {
      if (videoEnabled && !isAttached) {
        // Longer delay to ensure Agora track is fully initialized after join
        retryTimeout = setTimeout(() => {
          if (videoMountRef.value && props.renderer && props.participant.videoEnabled) {
            try {
              console.log('[DiagVideoTile] Attaching video for:', props.participant.id)
              props.renderer.attachVideo(videoMountRef.value, props.participant.id, props.videoKind)
              isAttached = true
            } catch (e) {
              console.warn('[DiagVideoTile] Failed to attach video:', e)
            }
          }
        }, 500) // Increased delay for track initialization
      } else if (!videoEnabled && isAttached) {
        props.renderer.detachVideo(videoMountRef.value)
        isAttached = false
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (retryTimeout) {
    clearTimeout(retryTimeout)
    retryTimeout = null
  }
  if (videoMountRef.value && props.renderer && isAttached) {
    props.renderer.detachVideo(videoMountRef.value)
    isAttached = false
  }
})
</script>

<style scoped>
.vc-video-tile {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--vc-video-tile-bg);
  border-radius: var(--vc-radius);
  overflow: hidden;
}

.vc-video-tile__video {
  position: absolute;
  inset: 0;
}

/* Style Agora video player and native video elements */
.vc-video-tile__video :deep(video),
.vc-video-tile__video :deep(div[id^="agora-video-player"]) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}

.vc-video-tile__video :deep(div[id^="agora-video-player"]) video {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}

.vc-video-tile__avatar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vc-video-tile-bg);
}

.vc-video-tile__avatar-img {
  width: 80px;
  height: 80px;
  border-radius: var(--vc-radius-full);
  object-fit: contain !important;
}

.vc-video-tile__avatar-initials {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vc-gradient);
  color: var(--vc-primary-fg);
  font-size: var(--vc-text-2xl);
  font-weight: var(--vc-font-bold);
  border-radius: var(--vc-radius-full);
}

.vc-video-tile__speaking-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--vc-speaking-ring);
  border-radius: var(--vc-radius);
  pointer-events: none;
  animation: vc-pulse 1.5s ease-in-out infinite;
}

@keyframes vc-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.vc-video-tile__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--vc-space-sm);
  pointer-events: none;
}

.vc-video-tile__top {
  display: flex;
  justify-content: flex-end;
}

.vc-video-tile__network {
  padding: var(--vc-space-xs) var(--vc-space-sm);
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--vc-radius-xs);
  color: white;
}

.vc-video-tile__network-icon--excellent {
  color: var(--vc-success);
}

.vc-video-tile__network-icon--good {
  color: var(--vc-primary);
}

.vc-video-tile__network-icon--fair {
  color: var(--vc-warn);
}

.vc-video-tile__network-icon--poor,
.vc-video-tile__network-icon--veryPoor {
  color: var(--vc-danger);
}

.vc-video-tile__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--vc-space-sm);
}

.vc-video-tile__info {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-xs);
  padding: var(--vc-space-sm);
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--vc-radius-xs);
  backdrop-filter: blur(8px);
}

.vc-video-tile__name {
  color: white;
  font-size: var(--vc-text-sm);
  font-weight: var(--vc-font-medium);
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
}

.vc-video-tile__you {
  font-size: var(--vc-text-xs);
  opacity: 0.8;
}

.vc-video-tile__role {
  font-size: var(--vc-text-xs);
  align-self: flex-start;
}

.vc-video-tile__status {
  display: flex;
  gap: var(--vc-space-xs);
}

.vc-video-tile__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: var(--vc-radius-xs);
  backdrop-filter: blur(8px);
}

.vc-video-tile__icon--screen {
  background: var(--vc-primary);
}
</style>
