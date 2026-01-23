<template>
  <div class="vc-prejoin">
    <div class="vc-prejoin__container">
      <!-- Header -->
      <div class="vc-prejoin__header">
        <h2 class="vc-heading vc-heading-lg">{{ $t('vc.prejoin.title') }}</h2>
        <p class="vc-text-muted">{{ $t('vc.prejoin.subtitle') }}</p>
      </div>

      <!-- Video Preview -->
      <div class="vc-prejoin__preview">
        <div ref="videoPreviewRef" class="vc-prejoin__video">
          <!-- Avatar when video is off -->
          <div v-if="!isPreviewEnabled" class="vc-prejoin__avatar">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
              <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 12c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 56c-10 0-18.7-5.1-24-12.9 0-7.9 16-12.3 24-12.3s24 4.4 24 12.3C58.7 62.9 50 68 40 68z" />
            </svg>
          </div>
        </div>

        <!-- Preview Controls -->
        <div class="vc-prejoin__preview-controls">
          <button
            class="vc-btn vc-btn-icon vc-btn-icon-lg"
            :class="{ 'vc-btn-danger': isMicMuted }"
            :aria-label="$t(isMicMuted ? 'vc.btn.unmute' : 'vc.btn.mute')"
            @click="toggleMic"
          >
            <svg v-if="!isMicMuted" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V20h2v-2.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
            </svg>
          </button>

          <button
            class="vc-btn vc-btn-icon vc-btn-icon-lg"
            :class="{ 'vc-btn-danger': !isPreviewEnabled }"
            :aria-label="$t(isPreviewEnabled ? 'vc.btn.cameraOff' : 'vc.btn.cameraOn')"
            @click="toggleVideo"
          >
            <svg v-if="isPreviewEnabled" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
            </svg>
          </button>
        </div>

        <!-- Audio Level Indicator -->
        <div v-if="!isMicMuted" class="vc-prejoin__audio-level">
          <div class="vc-prejoin__audio-level-bar" :style="{ width: `${audioLevel}%` }"></div>
        </div>
      </div>

      <!-- Device Selectors -->
      <div class="vc-prejoin__devices">
        <!-- Microphone -->
        <div class="vc-prejoin__device-group">
          <label class="vc-label">{{ $t('vc.label.microphone') }}</label>
          <select v-model="selectedMicId" class="vc-select" @change="handleMicChange">
            <option v-for="mic in devices.microphones" :key="mic.deviceId" :value="mic.deviceId">
              {{ mic.label || `Microphone ${mic.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <!-- Camera -->
        <div class="vc-prejoin__device-group">
          <label class="vc-label">{{ $t('vc.label.camera') }}</label>
          <select v-model="selectedCamId" class="vc-select" @change="handleCamChange">
            <option v-for="cam in devices.cameras" :key="cam.deviceId" :value="cam.deviceId">
              {{ cam.label || `Camera ${cam.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <!-- Speaker -->
        <div v-if="devices.speakers.length > 0" class="vc-prejoin__device-group">
          <label class="vc-label">{{ $t('vc.label.speaker') }}</label>
          <select v-model="selectedSpeakerId" class="vc-select" @change="handleSpeakerChange">
            <option v-for="speaker in devices.speakers" :key="speaker.deviceId" :value="speaker.deviceId">
              {{ speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>
      </div>

      <!-- Join Options -->
      <div class="vc-prejoin__options">
        <label class="vc-checkbox">
          <input v-model="joinMuted" type="checkbox" />
          <span>{{ $t('vc.label.joinMuted') }}</span>
        </label>
        <label class="vc-checkbox">
          <input v-model="joinVideoOff" type="checkbox" />
          <span>{{ $t('vc.label.joinVideoOff') }}</span>
        </label>
      </div>

      <!-- Advanced Options (Virtual BG, Beauty, etc.) -->
      <div v-if="showAdvancedOptions" class="vc-prejoin__advanced">
        <button class="vc-btn vc-btn-ghost" @click="isAdvancedOpen = !isAdvancedOpen">
          {{ $t('vc.prejoin.advancedSettings') }}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
            :class="{ 'vc-rotate-180': isAdvancedOpen }"
          >
            <path d="M4 6l4 4 4-4H4z" />
          </svg>
        </button>

        <div v-if="isAdvancedOpen" class="vc-prejoin__advanced-panel">
          <!-- Virtual Background -->
          <div v-if="features?.virtualBackground" class="vc-prejoin__advanced-section">
            <label class="vc-checkbox">
              <input v-model="enableVirtualBg" type="checkbox" />
              <span>{{ $t('vc.label.virtualBackground') }}</span>
            </label>
          </div>

          <!-- Noise Suppression -->
          <div v-if="features?.noiseSuppression" class="vc-prejoin__advanced-section">
            <label class="vc-checkbox">
              <input v-model="enableNoiseSuppression" type="checkbox" />
              <span>{{ $t('vc.label.noiseSuppression') }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Join Button -->
      <button 
        class="vc-btn vc-btn-primary vc-prejoin__join-btn" 
        :disabled="isJoining"
        @click="handleJoin"
      >
        <span v-if="isJoining" class="vc-prejoin__spinner"></span>
        {{ isJoining ? $t('vc.btn.joining') : $t('vc.btn.join') }}
      </button>

      <!-- Slot for custom content -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Devices, FeatureFlags, DeviceSelection, VideoRenderer } from '@diagvn/video-call-core-v2'

export interface DiagPrejoinV2Props {
  devices: Devices
  renderer?: VideoRenderer | null
  features?: Partial<FeatureFlags>
}

export interface DiagPrejoinV2Emits {
  (e: 'join', options: { joinMuted: boolean; joinVideoOff: boolean }): void
  (e: 'device-change', selection: DeviceSelection): void
}

const props = defineProps<DiagPrejoinV2Props>()
const emit = defineEmits<DiagPrejoinV2Emits>()

// Refs
const videoPreviewRef = ref<HTMLDivElement>()
const isPreviewEnabled = ref(true)
const isMicMuted = ref(false)
const audioLevel = ref(0)

// Device selection
const selectedMicId = ref(props.devices.selectedMicId || props.devices.microphones[0]?.deviceId)
const selectedCamId = ref(props.devices.selectedCamId || props.devices.cameras[0]?.deviceId)
const selectedSpeakerId = ref(props.devices.selectedSpeakerId || props.devices.speakers[0]?.deviceId)

// Join options
const joinMuted = ref(false)
const joinVideoOff = ref(false)

// Advanced options
const isAdvancedOpen = ref(false)
const enableVirtualBg = ref(false)
const enableNoiseSuppression = ref(true)

// State
const isJoining = ref(false)

// Computed
const showAdvancedOptions = computed(() => 
  props.features?.virtualBackground || props.features?.noiseSuppression || props.features?.beautyEffects
)

// Handlers
function toggleMic() {
  isMicMuted.value = !isMicMuted.value
}

function toggleVideo() {
  isPreviewEnabled.value = !isPreviewEnabled.value
  
  if (props.renderer && videoPreviewRef.value) {
    if (isPreviewEnabled.value) {
      props.renderer.attachPreview?.(videoPreviewRef.value, 'camera')
    } else {
      props.renderer.detachPreview?.(videoPreviewRef.value)
    }
  }
}

function handleMicChange() {
  emit('device-change', { micId: selectedMicId.value })
}

function handleCamChange() {
  emit('device-change', { camId: selectedCamId.value })
}

function handleSpeakerChange() {
  emit('device-change', { speakerId: selectedSpeakerId.value })
}

function handleJoin() {
  isJoining.value = true
  emit('join', {
    joinMuted: joinMuted.value || isMicMuted.value,
    joinVideoOff: joinVideoOff.value || !isPreviewEnabled.value
  })
}

// Watch for device changes from parent
watch(() => props.devices, (newDevices) => {
  if (newDevices.selectedMicId) selectedMicId.value = newDevices.selectedMicId
  if (newDevices.selectedCamId) selectedCamId.value = newDevices.selectedCamId
  if (newDevices.selectedSpeakerId) selectedSpeakerId.value = newDevices.selectedSpeakerId
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Attach preview if renderer available
  if (props.renderer?.attachPreview && videoPreviewRef.value && isPreviewEnabled.value) {
    props.renderer.attachPreview(videoPreviewRef.value, 'camera')
  }
})

onUnmounted(() => {
  if (props.renderer?.detachPreview && videoPreviewRef.value) {
    props.renderer.detachPreview(videoPreviewRef.value)
  }
})

defineExpose({
  videoPreviewRef
})
</script>

<style scoped>
.vc-prejoin {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--vc-space-xl);
  background: var(--vc-bg);
}

.vc-prejoin__container {
  width: 100%;
  max-width: 520px;
  background: var(--vc-surface);
  border-radius: var(--vc-radius-md);
  box-shadow: var(--vc-shadow-lg);
  padding: var(--vc-space-2xl);
}

.vc-prejoin__header {
  text-align: center;
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin__header p {
  margin-top: var(--vc-space-sm);
}

.vc-prejoin__preview {
  position: relative;
  margin-bottom: var(--vc-space-xl);
  border-radius: var(--vc-radius);
  overflow: hidden;
  background: var(--vc-video-tile-bg);
}

.vc-prejoin__video {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: var(--vc-video-tile-bg);
}

.vc-prejoin__video :deep(video) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror */
}

.vc-prejoin__avatar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vc-fg-subtle);
}

.vc-prejoin__preview-controls {
  position: absolute;
  bottom: var(--vc-space-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--vc-space-sm);
}

.vc-prejoin__preview-controls .vc-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
}

.vc-prejoin__preview-controls .vc-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.vc-prejoin__preview-controls .vc-btn-danger {
  background: var(--vc-danger);
}

.vc-prejoin__audio-level {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.vc-prejoin__audio-level-bar {
  height: 100%;
  background: var(--vc-success);
  transition: width 100ms ease;
}

.vc-prejoin__devices {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-lg);
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin__device-group {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-xs);
}

.vc-prejoin__options {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-md);
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin__advanced {
  margin-bottom: var(--vc-space-xl);
}

.vc-prejoin__advanced-panel {
  margin-top: var(--vc-space-md);
  padding: var(--vc-space-md);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-sm);
}

.vc-prejoin__advanced-section {
  padding: var(--vc-space-sm) 0;
}

.vc-prejoin__join-btn {
  width: 100%;
  padding: var(--vc-space-md) var(--vc-space-xl);
  font-size: var(--vc-text-md);
}

.vc-prejoin__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: vc-spin 0.8s linear infinite;
}

.vc-rotate-180 {
  transform: rotate(180deg);
}
</style>
