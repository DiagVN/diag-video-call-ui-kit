<template>
  <div class="vc-prejoin-panel">
    <div class="vc-prejoin-panel__container">
      <!-- Header -->
      <div class="vc-prejoin-panel__header">
        <h2 class="vc-heading vc-heading-lg">{{ $t('vc.state.prejoin') }}</h2>
      </div>

      <!-- Video Preview -->
      <div class="vc-prejoin-panel__preview">
        <div ref="videoPreviewRef" class="vc-prejoin-panel__video">
          <div v-if="!hasVideoPreview" class="vc-prejoin-panel__avatar">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
              <path
                d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 12c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 56c-10 0-18.7-5.1-24-12.9 0-7.9 16-12.3 24-12.3s24 4.4 24 12.3C58.7 62.9 50 68 40 68z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Device Selectors -->
      <div class="vc-prejoin-panel__devices">
        <!-- Microphone -->
        <div class="vc-prejoin-panel__device-group">
          <label class="vc-prejoin-panel__label">{{ $t('vc.label.microphone') }}</label>
          <select
            v-model="selectedMicId"
            class="vc-prejoin-panel__select"
            @change="handleMicChange"
          >
            <option v-for="mic in devices.microphones" :key="mic.deviceId" :value="mic.deviceId">
              {{ mic.label || `Microphone ${mic.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <!-- Camera -->
        <div class="vc-prejoin-panel__device-group">
          <label class="vc-prejoin-panel__label">{{ $t('vc.label.camera') }}</label>
          <select v-model="selectedCamId" class="vc-prejoin-panel__select" @change="handleCamChange">
            <option v-for="cam in devices.cameras" :key="cam.deviceId" :value="cam.deviceId">
              {{ cam.label || `Camera ${cam.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <!-- Speaker (if supported) -->
        <div v-if="devices.speakers.length > 0" class="vc-prejoin-panel__device-group">
          <label class="vc-prejoin-panel__label">{{ $t('vc.label.speaker') }}</label>
          <select
            v-model="selectedSpeakerId"
            class="vc-prejoin-panel__select"
            @change="handleSpeakerChange"
          >
            <option
              v-for="speaker in devices.speakers"
              :key="speaker.deviceId"
              :value="speaker.deviceId"
            >
              {{ speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>
      </div>

      <!-- Join Options -->
      <div class="vc-prejoin-panel__options">
        <label class="vc-prejoin-panel__checkbox">
          <input v-model="joinMuted" type="checkbox" />
          <span>{{ $t('vc.label.joinMuted') }}</span>
        </label>
        <label class="vc-prejoin-panel__checkbox">
          <input v-model="joinVideoOff" type="checkbox" />
          <span>{{ $t('vc.label.joinVideoOff') }}</span>
        </label>
      </div>

      <!-- Language Switcher -->
      <div class="vc-prejoin-panel__language">
        <label class="vc-prejoin-panel__label">{{ $t('vc.label.language') }}</label>
        <select v-model="currentLanguage" class="vc-prejoin-panel__select" @change="handleLanguageChange">
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <!-- Join Button -->
      <button class="vc-btn vc-btn-primary vc-prejoin-panel__join-btn" @click="handleJoin">
        {{ $t('vc.btn.join') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Devices } from '@diag/video-call-core'

export interface DiagPreJoinPanelProps {
  /** Available devices */
  devices: Devices
  /** Has video preview available */
  hasVideoPreview?: boolean
}

export interface DiagPreJoinPanelEmits {
  (
    event: 'join',
    payload: { joinMuted: boolean; joinVideoOff: boolean }
  ): void
  (
    event: 'device-change',
    payload: { micId?: string; camId?: string; speakerId?: string }
  ): void
  (event: 'language-change', locale: string): void
}

const props = withDefaults(defineProps<DiagPreJoinPanelProps>(), {
  hasVideoPreview: false
})

const emit = defineEmits<DiagPreJoinPanelEmits>()

const { locale } = useI18n()

// State
const videoPreviewRef = ref<HTMLDivElement>()
const joinMuted = ref(false)
const joinVideoOff = ref(false)
const selectedMicId = ref(props.devices.selectedMic || props.devices.microphones[0]?.deviceId)
const selectedCamId = ref(props.devices.selectedCam || props.devices.cameras[0]?.deviceId)
const selectedSpeakerId = ref(
  props.devices.selectedSpeaker || props.devices.speakers[0]?.deviceId
)
const currentLanguage = ref(locale.value)

// Handlers
function handleMicChange() {
  emit('device-change', { micId: selectedMicId.value })
}

function handleCamChange() {
  emit('device-change', { camId: selectedCamId.value })
}

function handleSpeakerChange() {
  emit('device-change', { speakerId: selectedSpeakerId.value })
}

function handleLanguageChange() {
  emit('language-change', currentLanguage.value)
}

function handleJoin() {
  emit('join', {
    joinMuted: joinMuted.value,
    joinVideoOff: joinVideoOff.value
  })
}

// Expose preview ref for video attachment
defineExpose({
  videoPreviewRef
})
</script>

<style scoped>
.vc-prejoin-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--vc-space-xl);
  background: var(--vc-bg);
}

.vc-prejoin-panel__container {
  width: 100%;
  max-width: 560px;
  background: var(--vc-surface);
  border-radius: var(--vc-radius);
  box-shadow: var(--vc-shadow);
  padding: var(--vc-space-2xl);
}

.vc-prejoin-panel__header {
  margin-bottom: var(--vc-space-xl);
  text-align: center;
}

.vc-prejoin-panel__preview {
  margin-bottom: var(--vc-space-xl);
  border-radius: var(--vc-radius);
  overflow: hidden;
  background: var(--vc-video-tile-bg);
}

.vc-prejoin-panel__video {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: var(--vc-video-tile-bg);
}

/* Ensure Agora video player fills the container */
.vc-prejoin-panel__video :deep(div[id^="agora-video"]),
.vc-prejoin-panel__video :deep(video) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.vc-prejoin-panel__avatar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vc-fg-subtle);
}

.vc-prejoin-panel__devices {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-lg);
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin-panel__device-group {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
}

.vc-prejoin-panel__label {
  font-size: var(--vc-text-sm);
  font-weight: var(--vc-font-medium);
  color: var(--vc-fg-muted);
}

.vc-prejoin-panel__select {
  width: 100%;
  padding: var(--vc-space-md);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-surface);
  color: var(--vc-fg);
  font-family: var(--vc-font-sans);
  font-size: var(--vc-text-base);
  cursor: pointer;
  transition: border-color var(--vc-transition-base);
}

.vc-prejoin-panel__select:hover {
  border-color: var(--vc-border-strong);
}

.vc-prejoin-panel__select:focus {
  outline: none;
  border-color: var(--vc-primary);
  box-shadow: var(--vc-focus-ring);
}

.vc-prejoin-panel__options {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-md);
  margin-bottom: var(--vc-space-xl);
  padding: var(--vc-space-lg);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-sm);
}

.vc-prejoin-panel__checkbox {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  cursor: pointer;
  user-select: none;
}

.vc-prejoin-panel__checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.vc-prejoin-panel__language {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin-panel__join-btn {
  width: 100%;
  padding: var(--vc-space-lg);
  font-size: var(--vc-text-lg);
  font-weight: var(--vc-font-semibold);
}
</style>
