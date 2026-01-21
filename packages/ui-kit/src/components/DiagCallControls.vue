<template>
  <div class="vc-call-controls">
    <div class="vc-call-controls__container">
      <!-- Left Group -->
      <div class="vc-call-controls__group">
        <!-- Microphone Toggle -->
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-lg vc-call-controls__btn"
          :class="{ 'vc-call-controls__btn--active': isMuted }"
          :aria-label="$t(isMuted ? 'vc.btn.unmute' : 'vc.btn.mute')"
          :title="$t('vc.tooltip.toggleMic')"
          @click="$emit('toggle-mic')"
        >
          <svg v-if="!isMuted" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
            />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V20h2v-2.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
            />
          </svg>
        </button>

        <!-- Camera Toggle -->
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-lg vc-call-controls__btn"
          :class="{ 'vc-call-controls__btn--active': isVideoOff }"
          :aria-label="$t(isVideoOff ? 'vc.btn.cameraOn' : 'vc.btn.cameraOff')"
          :title="$t('vc.tooltip.toggleCamera')"
          @click="$emit('toggle-cam')"
        >
          <svg v-if="!isVideoOff" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
            />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"
            />
          </svg>
        </button>
      </div>

      <!-- Center Group -->
      <div class="vc-call-controls__group vc-call-controls__group--center">
        <!-- Switch Camera (mobile) -->
        <button
          v-if="showSwitchCamera"
          class="vc-btn vc-btn-icon vc-call-controls__btn"
          :aria-label="$t('vc.btn.switchCamera')"
          :title="$t('vc.tooltip.switchCamera')"
          @click="$emit('switch-camera')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"
            />
          </svg>
        </button>

        <!-- Screen Share -->
        <button
          class="vc-btn vc-btn-icon vc-call-controls__btn"
          :class="{ 'vc-call-controls__btn--active': isScreenSharing }"
          :aria-label="$t(isScreenSharing ? 'vc.btn.shareStop' : 'vc.btn.shareStart')"
          :title="$t(isScreenSharing ? 'vc.tooltip.stopSharing' : 'vc.tooltip.shareScreen')"
          @click="isScreenSharing ? $emit('stop-screen-share') : $emit('start-screen-share')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 16V6h16v10H4zm9-5.87L16.87 14H13v3h-2v-3H7.13L11 10.13z"
            />
          </svg>
        </button>

        <!-- More Options -->
        <button
          class="vc-btn vc-btn-icon vc-call-controls__btn"
          :aria-label="$t('vc.btn.more')"
          @click="$emit('toggle-more')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
            />
          </svg>
        </button>
      </div>

      <!-- Right Group -->
      <div class="vc-call-controls__group">
        <!-- Participants -->
        <button
          class="vc-btn vc-btn-icon vc-call-controls__btn"
          :aria-label="$t('vc.btn.participants')"
          :title="$t('vc.tooltip.openParticipants')"
          @click="$emit('toggle-participants')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
            />
          </svg>
          <span v-if="participantCount > 0" class="vc-call-controls__badge">{{
            participantCount
          }}</span>
        </button>

        <!-- Leave Call -->
        <button
          class="vc-btn vc-btn-icon vc-btn-icon-lg vc-btn-danger vc-call-controls__leave-btn"
          :aria-label="$t('vc.btn.leave')"
          :title="$t('vc.tooltip.leaveCall')"
          @click="$emit('leave')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface DiagCallControlsProps {
  /** Is microphone muted */
  isMuted?: boolean
  /** Is video off */
  isVideoOff?: boolean
  /** Is screen sharing */
  isScreenSharing?: boolean
  /** Show switch camera button */
  showSwitchCamera?: boolean
  /** Number of participants */
  participantCount?: number
}

export interface DiagCallControlsEmits {
  (event: 'toggle-mic'): void
  (event: 'toggle-cam'): void
  (event: 'switch-camera'): void
  (event: 'start-screen-share'): void
  (event: 'stop-screen-share'): void
  (event: 'toggle-participants'): void
  (event: 'toggle-more'): void
  (event: 'leave'): void
}

withDefaults(defineProps<DiagCallControlsProps>(), {
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  showSwitchCamera: false,
  participantCount: 0
})

defineEmits<DiagCallControlsEmits>()
</script>

<style scoped>
.vc-call-controls {
  background: var(--vc-control-bar-bg);
  backdrop-filter: var(--vc-control-bar-backdrop);
  border-top: 1px solid var(--vc-border);
  padding: var(--vc-space-lg);
}

.vc-call-controls__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.vc-call-controls__group {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
}

.vc-call-controls__group--center {
  flex: 1;
  justify-content: center;
}

.vc-call-controls__btn {
  position: relative;
  background: var(--vc-surface);
  color: var(--vc-fg);
  border: 1px solid var(--vc-border);
}

.vc-call-controls__btn:hover:not(:disabled) {
  background: var(--vc-bg);
  transform: translateY(-2px);
}

.vc-call-controls__btn--active {
  background: var(--vc-danger);
  color: var(--vc-danger-fg);
  border-color: var(--vc-danger);
}

.vc-call-controls__leave-btn {
  background: var(--vc-danger);
  color: var(--vc-danger-fg);
  border: none;
}

.vc-call-controls__leave-btn:hover:not(:disabled) {
  background: #c12f2f;
  transform: translateY(-2px);
  box-shadow: var(--vc-shadow-md);
}

.vc-call-controls__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vc-primary);
  color: var(--vc-primary-fg);
  border-radius: var(--vc-radius-full);
  font-size: var(--vc-text-xs);
  font-weight: var(--vc-font-bold);
  line-height: 1;
}
</style>
