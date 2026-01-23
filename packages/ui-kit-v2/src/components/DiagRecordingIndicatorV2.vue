<template>
  <div v-if="isRecording" class="vc-recording-indicator">
    <span class="vc-recording-indicator__dot"></span>
    <span class="vc-recording-indicator__text">{{ $t('vc.status.recording') }}</span>
    <span v-if="showDuration" class="vc-recording-indicator__duration">{{ formattedDuration }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface DiagRecordingIndicatorV2Props {
  isRecording: boolean
  duration?: number
  showDuration?: boolean
}

const props = withDefaults(defineProps<DiagRecordingIndicatorV2Props>(), {
  isRecording: false,
  duration: 0,
  showDuration: true
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
.vc-recording-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 9999px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.vc-recording-indicator__dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.vc-recording-indicator__text {
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.vc-recording-indicator__duration {
  font-variant-numeric: tabular-nums;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
