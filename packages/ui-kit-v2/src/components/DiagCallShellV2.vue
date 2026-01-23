<template>
  <div class="vc-call-shell" :class="shellClasses">
    <!-- Status Bar -->
    <div v-if="showStatusBar" class="vc-call-shell__status">
      <div class="vc-call-shell__status-left">
        <span class="vc-call-shell__state" :class="`vc-call-shell__state--${callState}`">
          <span class="vc-call-shell__state-dot"></span>
          {{ $t(`vc.state.${callState}`) }}
        </span>
        <span v-if="duration > 0" class="vc-call-shell__duration">
          {{ formattedDuration }}
        </span>
        <!-- Recording Badge -->
        <span v-if="isRecording" class="vc-badge vc-badge-danger vc-call-shell__recording">
          <span class="vc-call-shell__recording-dot"></span>
          {{ $t('vc.label.recording') }}
        </span>
        <!-- Live Badge -->
        <span v-if="isLive" class="vc-badge vc-badge-danger vc-call-shell__live">
          {{ $t('vc.label.live') }}
        </span>
      </div>
      
      <div class="vc-call-shell__status-right">
        <!-- Network Quality -->
        <div v-if="networkQuality !== undefined" class="vc-call-shell__network" :title="networkLabel">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            :class="`vc-call-shell__network-icon--${networkLevel}`"
          >
            <rect x="1" y="14" width="3" height="5" rx="0.5" :opacity="networkQuality >= 1 ? 1 : 0.3" />
            <rect x="6" y="10" width="3" height="9" rx="0.5" :opacity="networkQuality >= 2 ? 1 : 0.3" />
            <rect x="11" y="6" width="3" height="13" rx="0.5" :opacity="networkQuality >= 3 ? 1 : 0.3" />
            <rect x="16" y="1" width="3" height="18" rx="0.5" :opacity="networkQuality >= 4 ? 1 : 0.3" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Top Bar Slot -->
    <div v-if="$slots.topbar" class="vc-call-shell__topbar">
      <slot name="topbar" />
    </div>

    <!-- Main Content -->
    <div class="vc-call-shell__main" :class="`vc-call-shell__main--${mode}`">
      <slot />
    </div>

    <!-- Bottom Bar -->
    <div v-if="$slots.bottombar" class="vc-call-shell__bottombar" :class="{ 'vc-call-shell__bottombar--hidden': !showControls }">
      <slot name="bottombar" />
    </div>

    <!-- Sidebar -->
    <Transition name="vc-slide-right">
      <div v-if="$slots.sidebar" class="vc-call-shell__sidebar">
        <slot name="sidebar" />
      </div>
    </Transition>

    <!-- Overlays -->
    <div v-if="$slots.overlays" class="vc-call-shell__overlays">
      <slot name="overlays" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { CallState, NetworkQuality, LayoutMode } from '@diagvn/video-call-core-v2'

export interface DiagCallShellV2Props {
  mode?: LayoutMode
  callState?: CallState
  duration?: number
  networkQuality?: NetworkQuality
  isRecording?: boolean
  isLive?: boolean
  theme?: 'light' | 'dark'
  showStatusBar?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<DiagCallShellV2Props>(), {
  mode: 'grid',
  callState: 'idle',
  duration: 0,
  isRecording: false,
  isLive: false,
  theme: 'light',
  showStatusBar: true,
  showControls: true
})

const shellClasses = computed(() => [
  `vc-call-shell--${props.mode}`,
  props.theme === 'dark' ? 'vc-theme-dark' : ''
])

const formattedDuration = computed(() => {
  const hours = Math.floor(props.duration / 3600)
  const minutes = Math.floor((props.duration % 3600) / 60)
  const seconds = props.duration % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const networkLevel = computed(() => {
  const q = props.networkQuality
  if (q === undefined || q === 0) return 'unknown'
  if (q === 1) return 'excellent'
  if (q === 2) return 'good'
  if (q <= 3) return 'fair'
  if (q <= 4) return 'poor'
  return 'bad'
})

const networkLabel = computed(() => {
  return `Network: ${networkLevel.value}`
})
</script>

<style scoped>
.vc-call-shell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--vc-bg);
  overflow: hidden;
}

.vc-call-shell__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-sm) var(--vc-space-lg);
  background: var(--vc-surface);
  border-bottom: 1px solid var(--vc-border);
  font-size: var(--vc-text-sm);
  z-index: var(--vc-z-sticky);
}

.vc-call-shell__status-left {
  display: flex;
  align-items: center;
  gap: var(--vc-space-lg);
}

.vc-call-shell__state {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  color: var(--vc-fg-muted);
  font-weight: var(--vc-font-medium);
}

.vc-call-shell__state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vc-fg-subtle);
}

.vc-call-shell__state--in_call .vc-call-shell__state-dot {
  background: var(--vc-success);
}

.vc-call-shell__state--reconnecting .vc-call-shell__state-dot {
  background: var(--vc-warn);
  animation: vc-pulse 1s infinite;
}

.vc-call-shell__duration {
  font-weight: var(--vc-font-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--vc-fg);
}

.vc-call-shell__recording {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
}

.vc-call-shell__recording-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: vc-pulse 1s infinite;
}

.vc-call-shell__network {
  display: flex;
  align-items: center;
}

.vc-call-shell__network-icon--excellent { color: var(--vc-success); }
.vc-call-shell__network-icon--good { color: var(--vc-primary); }
.vc-call-shell__network-icon--fair { color: var(--vc-warn); }
.vc-call-shell__network-icon--poor { color: var(--vc-danger); }
.vc-call-shell__network-icon--bad { color: var(--vc-danger); }
.vc-call-shell__network-icon--unknown { color: var(--vc-fg-subtle); }

.vc-call-shell__topbar {
  flex-shrink: 0;
  z-index: var(--vc-z-sticky);
}

.vc-call-shell__main {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.vc-call-shell__bottombar {
  flex-shrink: 0;
  z-index: var(--vc-z-sticky);
  transition: transform var(--vc-transition), opacity var(--vc-transition);
}

.vc-call-shell__bottombar--hidden {
  transform: translateY(100%);
  opacity: 0;
}

.vc-call-shell__sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 100%;
  background: var(--vc-surface);
  border-left: 1px solid var(--vc-border);
  z-index: var(--vc-z-dropdown);
  box-shadow: var(--vc-shadow-lg);
}

.vc-call-shell__overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--vc-z-overlay);
}

.vc-call-shell__overlays > :deep(*) {
  pointer-events: auto;
}

/* Slide transition */
.vc-slide-right-enter-active,
.vc-slide-right-leave-active {
  transition: transform var(--vc-transition-slow);
}

.vc-slide-right-enter-from,
.vc-slide-right-leave-to {
  transform: translateX(100%);
}

/* Mobile */
@media (max-width: 768px) {
  .vc-call-shell__sidebar {
    width: 100%;
  }
}
</style>
