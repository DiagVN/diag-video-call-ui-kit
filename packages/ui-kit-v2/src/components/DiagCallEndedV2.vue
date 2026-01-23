<template>
  <div class="vc-call-ended">
    <div class="vc-call-ended__content">
      <!-- Icon -->
      <div class="vc-call-ended__icon">
        <slot name="icon">
          <VcIcon :name="iconName" size="xl" />
        </slot>
      </div>

      <!-- Title -->
      <h1 class="vc-call-ended__title">{{ title }}</h1>

      <!-- Message -->
      <p v-if="message" class="vc-call-ended__message">{{ message }}</p>

      <!-- Call stats -->
      <div v-if="showStats && stats" class="vc-call-ended__stats">
        <div class="vc-call-ended__stat">
          <span class="vc-call-ended__stat-label">{{ $t('vc.label.duration') }}</span>
          <span class="vc-call-ended__stat-value">{{ formattedDuration }}</span>
        </div>
        <div v-if="stats.participantCount" class="vc-call-ended__stat">
          <span class="vc-call-ended__stat-label">{{ $t('vc.label.participants') }}</span>
          <span class="vc-call-ended__stat-value">{{ stats.participantCount }}</span>
        </div>
        <div v-if="stats.messageCount" class="vc-call-ended__stat">
          <span class="vc-call-ended__stat-label">{{ $t('vc.label.messages') }}</span>
          <span class="vc-call-ended__stat-value">{{ stats.messageCount }}</span>
        </div>
      </div>

      <!-- Rating -->
      <div v-if="showRating" class="vc-call-ended__rating">
        <p class="vc-call-ended__rating-label">{{ $t('vc.label.rateCall') }}</p>
        <div class="vc-call-ended__stars">
          <button
            v-for="star in 5"
            :key="star"
            class="vc-call-ended__star"
            :class="{ 'vc-call-ended__star--active': star <= rating }"
            @click="rating = star"
          >
            ⭐
          </button>
        </div>
        <textarea
          v-if="showFeedback && rating > 0"
          v-model="feedback"
          class="vc-call-ended__feedback"
          :placeholder="$t('vc.placeholder.feedback')"
          rows="3"
        />
      </div>

      <!-- Recording download -->
      <div v-if="recordingUrl" class="vc-call-ended__recording">
        <a
          :href="recordingUrl"
          download
          class="vc-call-ended__recording-link"
        >
          <VcIcon name="download" size="sm" /> {{ $t('vc.action.downloadRecording') }}
        </a>
      </div>

      <!-- Actions -->
      <div class="vc-call-ended__actions">
        <button
          v-if="showRejoin"
          class="vc-call-ended__btn vc-call-ended__btn--primary"
          @click="$emit('rejoin')"
        >
          {{ $t('vc.action.rejoin') }}
        </button>
        
        <button
          v-if="showNewCall"
          class="vc-call-ended__btn vc-call-ended__btn--secondary"
          @click="$emit('new-call')"
        >
          {{ $t('vc.action.newCall') }}
        </button>

        <button
          class="vc-call-ended__btn"
          @click="handleClose"
        >
          {{ $t('vc.action.close') }}
        </button>
      </div>

      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CallEndReason } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface CallStats {
  duration: number
  participantCount?: number
  messageCount?: number
}

export interface DiagCallEndedV2Props {
  reason?: CallEndReason
  stats?: CallStats | null
  recordingUrl?: string
  showStats?: boolean
  showRating?: boolean
  showFeedback?: boolean
  showRejoin?: boolean
  showNewCall?: boolean
  customTitle?: string
  customMessage?: string
}

export interface DiagCallEndedV2Emits {
  (e: 'rejoin'): void
  (e: 'new-call'): void
  (e: 'close'): void
  (e: 'submit-rating', data: { rating: number; feedback: string }): void
}

const props = withDefaults(defineProps<DiagCallEndedV2Props>(), {
  reason: 'left',
  stats: null,
  recordingUrl: '',
  showStats: true,
  showRating: false,
  showFeedback: true,
  showRejoin: true,
  showNewCall: false,
  customTitle: '',
  customMessage: ''
})

const emit = defineEmits<DiagCallEndedV2Emits>()

// State
const rating = ref(0)
const feedback = ref('')

// Computed
const iconName = computed((): 'blocked' | 'timeout' | 'error' | 'phone' | 'wave' => {
  switch (props.reason) {
    case 'kicked': return 'blocked'
    case 'timeout': return 'timeout'
    case 'error': return 'error'
    case 'host_ended': return 'phone'
    default: return 'wave'
  }
})

const title = computed(() => {
  if (props.customTitle) return props.customTitle
  
  switch (props.reason) {
    case 'left': return 'Call Ended'
    case 'kicked': return 'You were removed'
    case 'timeout': return 'Call timed out'
    case 'host_ended': return 'Host ended the call'
    case 'error': return 'Call disconnected'
    default: return 'Call Ended'
  }
})

const message = computed(() => {
  if (props.customMessage) return props.customMessage
  
  switch (props.reason) {
    case 'left': return 'Thank you for joining!'
    case 'kicked': return 'You have been removed from this call by the host.'
    case 'timeout': return 'The call has ended due to inactivity.'
    case 'host_ended': return 'The host has ended this meeting for everyone.'
    case 'error': return 'The call was disconnected due to a network issue.'
    default: return ''
  }
})

const formattedDuration = computed(() => {
  if (!props.stats?.duration) return '0:00'
  
  const hours = Math.floor(props.stats.duration / 3600)
  const minutes = Math.floor((props.stats.duration % 3600) / 60)
  const seconds = props.stats.duration % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${minutes}:${pad(seconds)}`
})

// Methods
function handleClose() {
  if (props.showRating && rating.value > 0) {
    emit('submit-rating', { rating: rating.value, feedback: feedback.value })
  }
  emit('close')
}
</script>

<style scoped>
.vc-call-ended {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--vc-space-xl);
  background: var(--vc-bg);
}

.vc-call-ended__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 480px;
  text-align: center;
}

/* Icon */
.vc-call-ended__icon {
  font-size: 64px;
  margin-bottom: var(--vc-space-lg);
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Title & Message */
.vc-call-ended__title {
  margin: 0 0 var(--vc-space-sm);
  font-size: var(--vc-text-2xl);
  font-weight: 700;
  color: var(--vc-text);
}

.vc-call-ended__message {
  margin: 0 0 var(--vc-space-xl);
  font-size: var(--vc-text-md);
  color: var(--vc-text-secondary);
}

/* Stats */
.vc-call-ended__stats {
  display: flex;
  gap: var(--vc-space-xl);
  margin-bottom: var(--vc-space-xl);
  padding: var(--vc-space-lg);
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-lg);
}

.vc-call-ended__stat {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-xs);
}

.vc-call-ended__stat-label {
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
}

.vc-call-ended__stat-value {
  font-size: var(--vc-text-xl);
  font-weight: 600;
  color: var(--vc-text);
}

/* Rating */
.vc-call-ended__rating {
  margin-bottom: var(--vc-space-xl);
  width: 100%;
}

.vc-call-ended__rating-label {
  margin: 0 0 var(--vc-space-md);
  font-size: var(--vc-text-md);
  color: var(--vc-text);
}

.vc-call-ended__stars {
  display: flex;
  justify-content: center;
  gap: var(--vc-space-sm);
  margin-bottom: var(--vc-space-md);
}

.vc-call-ended__star {
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  filter: grayscale(1);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.vc-call-ended__star:hover,
.vc-call-ended__star--active {
  filter: grayscale(0);
  opacity: 1;
  transform: scale(1.2);
}

.vc-call-ended__feedback {
  width: 100%;
  padding: var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
  resize: vertical;
}

.vc-call-ended__feedback:focus {
  outline: none;
  border-color: var(--vc-primary);
}

/* Recording */
.vc-call-ended__recording {
  margin-bottom: var(--vc-space-xl);
}

.vc-call-ended__recording-link {
  display: inline-flex;
  align-items: center;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-md);
  color: var(--vc-primary);
  text-decoration: none;
  font-size: var(--vc-text-sm);
  transition: background 0.2s ease;
}

.vc-call-ended__recording-link:hover {
  background: var(--vc-bg-hover);
}

/* Actions */
.vc-call-ended__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--vc-space-md);
}

.vc-call-ended__btn {
  padding: var(--vc-space-sm) var(--vc-space-xl);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  background: transparent;
  color: var(--vc-text);
  font-size: var(--vc-text-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-call-ended__btn:hover {
  background: var(--vc-bg-hover);
}

.vc-call-ended__btn--primary {
  background: var(--vc-primary);
  border-color: var(--vc-primary);
  color: white;
}

.vc-call-ended__btn--primary:hover {
  background: var(--vc-primary-dark, #2980b9);
}

.vc-call-ended__btn--secondary {
  background: var(--vc-bg-secondary);
}
</style>
