<template>
  <div class="vc-call-shell" :class="[`vc-call-shell--${mode}`, themeClass]">
    <!-- Status Bar -->
    <div v-if="showStatusBar" class="vc-call-shell__status">
      <div class="vc-call-shell__status-left">
        <span class="vc-call-shell__state">{{ $t(`vc.state.${callState}`) }}</span>
        <span v-if="duration > 0" class="vc-call-shell__duration">{{ formattedDuration }}</span>
      </div>
      <div class="vc-call-shell__status-right">
        <div v-if="networkQuality !== undefined" class="vc-call-shell__network">
          <span
            class="vc-call-shell__network-icon"
            :class="`vc-call-shell__network-icon--${networkQualityLevel}`"
            :aria-label="$t(`vc.network.${networkQualityLevel}`)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                :opacity="networkQuality >= 1 ? 1 : 0.3"
                d="M2 13h2v2H2v-2zm4-4h2v6H6V9zm4-4h2v10h-2V5zm4-4h2v14h-2V1z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Top Bar Slot -->
    <div v-if="$slots.topbar" class="vc-call-shell__topbar">
      <slot name="topbar" />
    </div>

    <!-- Main Content Area -->
    <div class="vc-call-shell__main">
      <slot />
    </div>

    <!-- Bottom Bar Slot -->
    <div v-if="$slots.bottombar" class="vc-call-shell__bottombar">
      <slot name="bottombar" />
    </div>

    <!-- Sidebar Slot -->
    <div v-if="$slots.sidebar" class="vc-call-shell__sidebar">
      <slot name="sidebar" />
    </div>

    <!-- Overlays Slot -->
    <div v-if="$slots.overlays" class="vc-call-shell__overlays">
      <slot name="overlays" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CallState, NetworkQuality } from '@diagvn/video-call-core'

export interface DiagCallShellProps {
  /** Layout mode */
  mode?: 'grid' | 'speaker' | 'content'
  /** Current call state */
  callState?: CallState
  /** Call duration in seconds */
  duration?: number
  /** Network quality level */
  networkQuality?: NetworkQuality
  /** Show status bar */
  showStatusBar?: boolean
  /** Theme (light or dark) */
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<DiagCallShellProps>(), {
  mode: 'grid',
  callState: 'idle',
  duration: 0,
  showStatusBar: true,
  theme: 'light'
})

const themeClass = computed(() => (props.theme === 'dark' ? 'vc-theme-dark' : ''))

const networkQualityLevel = computed(() => {
  if (props.networkQuality === undefined) return 'unknown'
  if (props.networkQuality >= 4) return 'excellent'
  if (props.networkQuality === 3) return 'good'
  if (props.networkQuality === 2) return 'fair'
  if (props.networkQuality === 1) return 'poor'
  return 'veryPoor'
})

const formattedDuration = computed(() => {
  const hours = Math.floor(props.duration / 3600)
  const minutes = Math.floor((props.duration % 3600) / 60)
  const seconds = props.duration % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})
</script>

<style scoped>
.vc-call-shell {
  position: relative;
  width: 100%;
  height: 100vh;
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
  gap: var(--vc-space-md);
}

.vc-call-shell__state {
  color: var(--vc-fg-muted);
  font-weight: var(--vc-font-medium);
}

.vc-call-shell__duration {
  color: var(--vc-fg);
  font-weight: var(--vc-font-semibold);
  font-variant-numeric: tabular-nums;
}

.vc-call-shell__network {
  display: flex;
  align-items: center;
}

.vc-call-shell__network-icon {
  display: flex;
  align-items: center;
}

.vc-call-shell__network-icon--excellent {
  color: var(--vc-success);
}

.vc-call-shell__network-icon--good {
  color: var(--vc-primary);
}

.vc-call-shell__network-icon--fair {
  color: var(--vc-warn);
}

.vc-call-shell__network-icon--poor,
.vc-call-shell__network-icon--veryPoor {
  color: var(--vc-danger);
}

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
}

.vc-call-shell__sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  background: var(--vc-surface);
  border-left: 1px solid var(--vc-border);
  z-index: var(--vc-z-dropdown);
}

.vc-call-shell__overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--vc-z-overlay);
}

.vc-call-shell__overlays > * {
  pointer-events: auto;
}

/* Layout Modes */
.vc-call-shell--grid .vc-call-shell__main {
  display: grid;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-sm);
}

.vc-call-shell--speaker .vc-call-shell__main {
  display: flex;
  flex-direction: column;
}

.vc-call-shell--content .vc-call-shell__main {
  display: flex;
}
</style>
