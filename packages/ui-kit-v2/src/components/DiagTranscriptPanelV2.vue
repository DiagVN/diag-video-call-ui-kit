<template>
  <div class="vc-transcript-panel">
    <!-- Header -->
    <div class="vc-transcript-panel__header">
      <h3 class="vc-transcript-panel__title">{{ $t('vc.title.transcript') }}</h3>
      <div class="vc-transcript-panel__controls">
        <button
          v-if="canDownload"
          class="vc-transcript-panel__btn"
          :title="$t('vc.action.download')"
          @click="$emit('download')"
        >
          <VcIcon name="download" size="sm" />
        </button>
        <button class="vc-transcript-panel__close" @click="$emit('close')">
          <VcIcon name="close" size="sm" />
        </button>
      </div>
    </div>

    <!-- Status -->
    <div v-if="!isActive" class="vc-transcript-panel__status">
      <div class="vc-transcript-panel__status-content">
        <VcIcon name="document" size="lg" class="vc-transcript-panel__status-icon" />
        <p class="vc-transcript-panel__status-text">
          {{ $t('vc.status.transcriptOff') }}
        </p>
        <button
          v-if="canToggle"
          class="vc-transcript-panel__start-btn"
          @click="$emit('start')"
        >
          {{ $t('vc.action.startTranscript') }}
        </button>
      </div>
    </div>

    <!-- Transcript entries -->
    <div v-else ref="transcriptRef" class="vc-transcript-panel__content">
      <div v-if="entries.length === 0" class="vc-transcript-panel__empty">
        <div class="vc-transcript-panel__listening">
          <span class="vc-transcript-panel__listening-dot" />
          <span class="vc-transcript-panel__listening-dot" />
          <span class="vc-transcript-panel__listening-dot" />
        </div>
        <p>{{ $t('vc.message.listening') }}</p>
      </div>

      <div
        v-for="entry in entries"
        :key="entry.id"
        class="vc-transcript-panel__entry"
        :class="{
          'vc-transcript-panel__entry--local': entry.isLocal,
          'vc-transcript-panel__entry--final': entry.isFinal
        }"
      >
        <!-- Speaker info -->
        <div class="vc-transcript-panel__speaker">
          <span class="vc-transcript-panel__speaker-name">
            {{ entry.speakerName }}
            <span v-if="entry.isLocal" class="vc-transcript-panel__you">({{ $t('vc.label.you') }})</span>
          </span>
          <span class="vc-transcript-panel__time">{{ formatTime(entry.timestamp) }}</span>
        </div>

        <!-- Text -->
        <p class="vc-transcript-panel__text">
          {{ entry.text }}
          <span v-if="!entry.isFinal" class="vc-transcript-panel__interim">...</span>
        </p>

        <!-- Language tag -->
        <span v-if="entry.language && showLanguage" class="vc-transcript-panel__language">
          {{ entry.language }}
        </span>
      </div>
    </div>

    <!-- Footer controls -->
    <div v-if="isActive" class="vc-transcript-panel__footer">
      <div class="vc-transcript-panel__footer-status">
        <span class="vc-transcript-panel__recording-dot" />
        {{ $t('vc.status.transcribing') }}
      </div>
      <button
        v-if="canToggle"
        class="vc-transcript-panel__stop-btn"
        @click="$emit('stop')"
      >
        {{ $t('vc.action.stopTranscript') }}
      </button>
    </div>

    <!-- Language selector -->
    <div v-if="showLanguageSelector" class="vc-transcript-panel__language-selector">
      <label>{{ $t('vc.label.language') }}:</label>
      <select
        :value="selectedLanguage"
        @change="$emit('change-language', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { TranscriptEntry } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

interface LanguageOption {
  code: string
  name: string
}

export interface DiagTranscriptPanelV2Props {
  entries: readonly TranscriptEntry[]
  isActive?: boolean
  canToggle?: boolean
  canDownload?: boolean
  showLanguage?: boolean
  showLanguageSelector?: boolean
  selectedLanguage?: string
  availableLanguages?: LanguageOption[]
}

export interface DiagTranscriptPanelV2Emits {
  (e: 'close'): void
  (e: 'start'): void
  (e: 'stop'): void
  (e: 'download'): void
  (e: 'change-language', code: string): void
}

const props = withDefaults(defineProps<DiagTranscriptPanelV2Props>(), {
  isActive: false,
  canToggle: true,
  canDownload: true,
  showLanguage: false,
  showLanguageSelector: false,
  selectedLanguage: 'en-US',
  availableLanguages: () => [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'vi-VN', name: 'Tiếng Việt' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' }
  ]
})

defineEmits<DiagTranscriptPanelV2Emits>()

// Refs
const transcriptRef = ref<HTMLElement | null>(null)

// Methods
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Auto-scroll to bottom
watch(
  () => props.entries.length,
  () => {
    nextTick(() => {
      if (transcriptRef.value) {
        transcriptRef.value.scrollTop = transcriptRef.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.vc-transcript-panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: 100%;
  height: 100%;
  background: var(--vc-bg);
  border-left: 1px solid var(--vc-border);
}

/* Header */
.vc-transcript-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-md);
  border-bottom: 1px solid var(--vc-border);
}

.vc-transcript-panel__title {
  margin: 0;
  font-size: var(--vc-text-md);
  font-weight: 600;
}

.vc-transcript-panel__controls {
  display: flex;
  gap: var(--vc-space-sm);
}

.vc-transcript-panel__btn,
.vc-transcript-panel__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
}

.vc-transcript-panel__btn:hover,
.vc-transcript-panel__close:hover {
  background: var(--vc-bg-hover);
}

/* Status */
.vc-transcript-panel__status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--vc-space-xl);
}

.vc-transcript-panel__status-content {
  text-align: center;
}

.vc-transcript-panel__status-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--vc-space-md);
}

.vc-transcript-panel__status-text {
  margin: 0 0 var(--vc-space-md);
  color: var(--vc-text-secondary);
}

.vc-transcript-panel__start-btn {
  padding: var(--vc-space-sm) var(--vc-space-lg);
  border: none;
  background: var(--vc-primary);
  color: white;
  border-radius: var(--vc-radius-md);
  font-size: var(--vc-text-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.vc-transcript-panel__start-btn:hover {
  background: var(--vc-primary-dark, #2980b9);
}

/* Content */
.vc-transcript-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--vc-space-md);
}

.vc-transcript-panel__empty {
  text-align: center;
  padding: var(--vc-space-xl);
  color: var(--vc-text-secondary);
}

.vc-transcript-panel__listening {
  display: flex;
  justify-content: center;
  gap: var(--vc-space-xs);
  margin-bottom: var(--vc-space-md);
}

.vc-transcript-panel__listening-dot {
  width: 8px;
  height: 8px;
  background: var(--vc-primary);
  border-radius: 50%;
  animation: listening 1.4s infinite ease-in-out;
}

.vc-transcript-panel__listening-dot:nth-child(2) { animation-delay: 0.2s; }
.vc-transcript-panel__listening-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes listening {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Entry */
.vc-transcript-panel__entry {
  margin-bottom: var(--vc-space-md);
  padding: var(--vc-space-sm);
  border-radius: var(--vc-radius-md);
  background: var(--vc-bg-secondary);
  transition: opacity 0.2s ease;
}

.vc-transcript-panel__entry--local {
  background: rgba(var(--vc-primary-rgb, 52, 152, 219), 0.1);
}

.vc-transcript-panel__entry:not(.vc-transcript-panel__entry--final) {
  opacity: 0.7;
}

.vc-transcript-panel__speaker {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--vc-space-xs);
}

.vc-transcript-panel__speaker-name {
  font-size: var(--vc-text-sm);
  font-weight: 500;
  color: var(--vc-text);
}

.vc-transcript-panel__you {
  font-weight: normal;
  color: var(--vc-text-secondary);
  font-size: var(--vc-text-xs);
}

.vc-transcript-panel__time {
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
}

.vc-transcript-panel__text {
  margin: 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text);
  line-height: 1.5;
}

.vc-transcript-panel__interim {
  color: var(--vc-text-secondary);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.vc-transcript-panel__language {
  display: inline-block;
  margin-top: var(--vc-space-xs);
  padding: 2px 6px;
  background: var(--vc-bg);
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
}

/* Footer */
.vc-transcript-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-sm) var(--vc-space-md);
  border-top: 1px solid var(--vc-border);
}

.vc-transcript-panel__footer-status {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
}

.vc-transcript-panel__recording-dot {
  width: 8px;
  height: 8px;
  background: var(--vc-danger);
  border-radius: 50%;
  animation: pulse 1s infinite;
}

.vc-transcript-panel__stop-btn {
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: 1px solid var(--vc-danger);
  background: transparent;
  color: var(--vc-danger);
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-transcript-panel__stop-btn:hover {
  background: var(--vc-danger);
  color: white;
}

/* Language selector */
.vc-transcript-panel__language-selector {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-sm) var(--vc-space-md);
  border-top: 1px solid var(--vc-border);
  font-size: var(--vc-text-sm);
}

.vc-transcript-panel__language-selector select {
  flex: 1;
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
}
</style>
