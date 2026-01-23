<template>
  <div class="vc-topbar">
    <!-- Left section -->
    <div class="vc-topbar__section vc-topbar__section--left">
      <!-- Logo/brand -->
      <slot name="brand">
        <div class="vc-topbar__brand">
          <VcIcon name="video-call" size="md" class="vc-topbar__logo" />
          <span v-if="title" class="vc-topbar__title">{{ title }}</span>
        </div>
      </slot>

      <!-- Call timer -->
      <div v-if="showTimer" class="vc-topbar__timer">
        {{ formattedDuration }}
      </div>

      <slot name="left" />
    </div>

    <!-- Center section -->
    <div class="vc-topbar__section vc-topbar__section--center">
      <!-- Recording indicator -->
      <div v-if="isRecording" class="vc-topbar__indicator vc-topbar__indicator--recording">
        <span class="vc-topbar__indicator-dot" />
        {{ $t('vc.status.recording') }}
      </div>

      <!-- Live streaming indicator -->
      <div v-if="isLiveStreaming" class="vc-topbar__indicator vc-topbar__indicator--live">
        <span class="vc-topbar__indicator-dot" />
        {{ $t('vc.status.live') }}
      </div>

      <!-- Encryption badge -->
      <div v-if="isEncrypted" class="vc-topbar__badge vc-topbar__badge--encrypted">
        <VcIcon name="lock" size="sm" /> {{ $t('vc.status.encrypted') }}
      </div>

      <slot name="center" />
    </div>

    <!-- Right section -->
    <div class="vc-topbar__section vc-topbar__section--right">
      <slot name="right" />

      <!-- Network quality indicator -->
      <div v-if="showNetworkQuality" class="vc-topbar__network" :title="networkQualityText">
        <span class="vc-topbar__network-icon" :class="networkQualityClass">
          <VcIcon :name="networkQualityIconName" size="sm" />
        </span>
      </div>

      <!-- Participants count -->
      <button
        v-if="showParticipantCount"
        class="vc-topbar__btn"
        :title="$t('vc.action.participants')"
        @click="$emit('toggle-participants')"
      >
        <VcIcon name="participants" size="sm" /> {{ participantCount }}
      </button>

      <!-- Settings button -->
      <button
        v-if="showSettings"
        class="vc-topbar__btn"
        :title="$t('vc.action.settings')"
        @click="$emit('open-settings')"
      >
        <VcIcon name="settings" size="sm" />
      </button>

      <!-- Layout button -->
      <button
        v-if="showLayoutToggle"
        class="vc-topbar__btn"
        :title="$t('vc.action.layout')"
        @click="$emit('toggle-layout')"
      >
        {{ layoutIcon }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutMode, NetworkQuality } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface DiagTopBarV2Props {
  title?: string
  callDuration?: number
  isRecording?: boolean
  isLiveStreaming?: boolean
  isEncrypted?: boolean
  networkQuality?: NetworkQuality
  participantCount?: number
  layout?: LayoutMode
  showTimer?: boolean
  showNetworkQuality?: boolean
  showParticipantCount?: boolean
  showSettings?: boolean
  showLayoutToggle?: boolean
}

export interface DiagTopBarV2Emits {
  (e: 'toggle-participants'): void
  (e: 'open-settings'): void
  (e: 'toggle-layout'): void
}

const props = withDefaults(defineProps<DiagTopBarV2Props>(), {
  title: '',
  callDuration: 0,
  isRecording: false,
  isLiveStreaming: false,
  isEncrypted: false,
  networkQuality: 0,
  participantCount: 0,
  layout: 'grid',
  showTimer: true,
  showNetworkQuality: true,
  showParticipantCount: true,
  showSettings: false,
  showLayoutToggle: false
})

defineEmits<DiagTopBarV2Emits>()

// Computed
const formattedDuration = computed(() => {
  const hours = Math.floor(props.callDuration / 3600)
  const minutes = Math.floor((props.callDuration % 3600) / 60)
  const seconds = props.callDuration % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
})

const networkQualityIconName = computed((): 'signal-strong' | 'signal-weak' | 'no-signal' => {
  const q = props.networkQuality
  if (q >= 3) return 'signal-strong'
  if (q >= 1) return 'signal-weak'
  return 'no-signal'
})

const networkQualityClass = computed(() => {
  const q = props.networkQuality
  if (q >= 4) return 'vc-topbar__network-icon--excellent'
  if (q >= 3) return 'vc-topbar__network-icon--good'
  if (q >= 2) return 'vc-topbar__network-icon--fair'
  if (q >= 1) return 'vc-topbar__network-icon--poor'
  return 'vc-topbar__network-icon--none'
})

const networkQualityText = computed(() => {
  const q = props.networkQuality
  if (q >= 4) return 'Excellent'
  if (q >= 3) return 'Good'
  if (q >= 2) return 'Fair'
  if (q >= 1) return 'Poor'
  return 'Unknown'
})

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
.vc-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg-secondary);
  border-bottom: 1px solid var(--vc-border);
  min-height: 48px;
}

/* Sections */
.vc-topbar__section {
  display: flex;
  align-items: center;
  gap: var(--vc-space-md);
}

.vc-topbar__section--left {
  flex: 1;
}

.vc-topbar__section--center {
  flex: 1;
  justify-content: center;
}

.vc-topbar__section--right {
  flex: 1;
  justify-content: flex-end;
}

/* Brand */
.vc-topbar__brand {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
}

.vc-topbar__logo {
  font-size: 24px;
}

.vc-topbar__title {
  font-weight: 600;
  font-size: var(--vc-text-md);
  color: var(--vc-text);
}

/* Timer */
.vc-topbar__timer {
  font-size: var(--vc-text-sm);
  font-family: monospace;
  color: var(--vc-text-secondary);
  background: var(--vc-bg);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border-radius: var(--vc-radius-sm);
}

/* Indicators */
.vc-topbar__indicator {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  font-size: var(--vc-text-sm);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border-radius: var(--vc-radius-sm);
  animation: fade-in 0.3s ease;
}

.vc-topbar__indicator--recording {
  background: rgba(231, 76, 60, 0.2);
  color: var(--vc-danger);
}

.vc-topbar__indicator--live {
  background: rgba(231, 76, 60, 0.2);
  color: var(--vc-danger);
}

.vc-topbar__indicator-dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Badges */
.vc-topbar__badge {
  font-size: var(--vc-text-xs);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border-radius: var(--vc-radius-sm);
}

.vc-topbar__badge--encrypted {
  background: rgba(39, 174, 96, 0.2);
  color: var(--vc-success);
}

/* Network quality */
.vc-topbar__network {
  cursor: help;
}

.vc-topbar__network-icon {
  font-size: 18px;
}

.vc-topbar__network-icon--excellent {
  filter: hue-rotate(90deg) saturate(1.5);
}

.vc-topbar__network-icon--good {
  filter: hue-rotate(45deg);
}

.vc-topbar__network-icon--fair {
  filter: hue-rotate(0deg);
}

.vc-topbar__network-icon--poor {
  filter: hue-rotate(-30deg);
}

.vc-topbar__network-icon--none {
  opacity: 0.5;
}

/* Buttons */
.vc-topbar__btn {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: none;
  background: var(--vc-bg);
  color: var(--vc-text);
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
  font-size: var(--vc-text-sm);
  transition: background 0.2s ease;
}

.vc-topbar__btn:hover {
  background: var(--vc-bg-hover);
}

/* Mobile */
@media (max-width: 768px) {
  .vc-topbar {
    padding: var(--vc-space-xs) var(--vc-space-sm);
  }

  .vc-topbar__title {
    display: none;
  }

  .vc-topbar__section--center {
    display: none;
  }
}
</style>
