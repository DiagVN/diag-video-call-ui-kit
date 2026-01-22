<template>
  <div class="vc-transcript" :class="{ 'vc-transcript--minimized': minimized }">
    <div class="vc-transcript__header">
      <div class="vc-transcript__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
        </svg>
        <span>{{ $t('vc.label.transcript') }}</span>
        <span v-if="isLive" class="vc-transcript__live-badge">{{ $t('vc.label.live') }}</span>
      </div>
      <div class="vc-transcript__actions">
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-sm"
          :title="$t('vc.tooltip.clearTranscript')"
          @click="$emit('clear')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-sm"
          :title="$t(minimized ? 'vc.tooltip.expandTranscript' : 'vc.tooltip.minimizeTranscript')"
          @click="minimized = !minimized"
        >
          <svg v-if="minimized" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
        </button>
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-sm"
          :title="$t('vc.tooltip.closeTranscript')"
          @click="$emit('close')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="!minimized" ref="entriesContainer" class="vc-transcript__entries">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="vc-transcript__entry"
        :class="{ 'vc-transcript__entry--interim': !entry.isFinal }"
      >
        <div class="vc-transcript__entry-header">
          <span class="vc-transcript__entry-name">{{ entry.participantName }}</span>
          <span class="vc-transcript__entry-time">{{ formatTime(entry.timestamp) }}</span>
        </div>
        <div class="vc-transcript__entry-text">{{ entry.text }}</div>
      </div>
      
      <div v-if="entries.length === 0" class="vc-transcript__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
        </svg>
        <p>{{ $t('vc.label.noTranscript') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { TranscriptEntry } from '@diagvn/video-call-core'

export interface DiagTranscriptProps {
  /** Transcript entries */
  entries: TranscriptEntry[]
  /** Is transcription currently active */
  isLive?: boolean
}

export interface DiagTranscriptEmits {
  (event: 'close'): void
  (event: 'clear'): void
}

const props = withDefaults(defineProps<DiagTranscriptProps>(), {
  isLive: false
})

defineEmits<DiagTranscriptEmits>()

const minimized = ref(false)
const entriesContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new entries arrive
watch(
  () => props.entries.length,
  async () => {
    await nextTick()
    if (entriesContainer.value) {
      entriesContainer.value.scrollTop = entriesContainer.value.scrollHeight
    }
  }
)

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.vc-transcript {
  display: flex;
  flex-direction: column;
  background: var(--vc-surface);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  box-shadow: var(--vc-shadow-lg);
  overflow: hidden;
  max-height: 400px;
  min-width: 300px;
}

.vc-transcript--minimized {
  max-height: auto;
}

.vc-transcript__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg);
  border-bottom: 1px solid var(--vc-border);
}

.vc-transcript__title {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  font-weight: var(--vc-font-semibold);
  font-size: var(--vc-text-sm);
  color: var(--vc-fg);
}

.vc-transcript__live-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--vc-danger);
  color: var(--vc-danger-fg);
  font-size: var(--vc-text-xs);
  font-weight: var(--vc-font-bold);
  border-radius: var(--vc-radius-full);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.vc-transcript__actions {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
}

.vc-transcript__entries {
  flex: 1;
  overflow-y: auto;
  padding: var(--vc-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
}

.vc-transcript__entry {
  padding: var(--vc-space-sm);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-sm);
}

.vc-transcript__entry--interim {
  opacity: 0.7;
  border-left: 2px solid var(--vc-primary);
}

.vc-transcript__entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--vc-space-xs);
}

.vc-transcript__entry-name {
  font-weight: var(--vc-font-semibold);
  font-size: var(--vc-text-xs);
  color: var(--vc-primary);
}

.vc-transcript__entry-time {
  font-size: var(--vc-text-xs);
  color: var(--vc-muted-fg);
}

.vc-transcript__entry-text {
  font-size: var(--vc-text-sm);
  color: var(--vc-fg);
  line-height: 1.5;
}

.vc-transcript__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--vc-space-xl);
  text-align: center;
  color: var(--vc-muted-fg);
}

.vc-transcript__empty p {
  margin-top: var(--vc-space-sm);
  font-size: var(--vc-text-sm);
}
</style>
