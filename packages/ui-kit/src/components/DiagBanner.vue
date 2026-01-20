<template>
  <div v-if="visible" class="vc-banner" :class="`vc-banner--${type}`" role="alert">
    <div class="vc-banner__icon">
      <svg
        v-if="type === 'reconnecting'"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="vc-banner__spinner"
      >
        <path
          d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
        />
      </svg>
      <svg
        v-else-if="type === 'poor-network'"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
      <svg
        v-else-if="type === 'recording'"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="8" />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        />
      </svg>
    </div>

    <div class="vc-banner__message">
      {{ $t(messageKey) }}
    </div>

    <button v-if="dismissible" class="vc-banner__close" @click="$emit('dismiss')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface DiagBannerProps {
  type: 'reconnecting' | 'poor-network' | 'recording' | 'info'
  messageKey: string
  visible?: boolean
  dismissible?: boolean
}

export interface DiagBannerEmits {
  (event: 'dismiss'): void
}

withDefaults(defineProps<DiagBannerProps>(), {
  visible: true,
  dismissible: false
})

defineEmits<DiagBannerEmits>()
</script>

<style scoped>
.vc-banner {
  display: flex;
  align-items: center;
  gap: var(--vc-space-md);
  padding: var(--vc-space-md) var(--vc-space-lg);
  background: var(--vc-info-light);
  border-bottom: 1px solid var(--vc-border);
  color: var(--vc-info-fg);
  font-size: var(--vc-text-sm);
}

.vc-banner--reconnecting {
  background: var(--vc-warn-light);
  color: var(--vc-warn);
}

.vc-banner--poor-network {
  background: var(--vc-warn-light);
  color: var(--vc-warn);
}

.vc-banner--recording {
  background: var(--vc-danger-light);
  color: var(--vc-danger);
}

.vc-banner__icon {
  display: flex;
  align-items: center;
}

.vc-banner__spinner {
  animation: vc-spin 1s linear infinite;
}

@keyframes vc-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.vc-banner__message {
  flex: 1;
  font-weight: var(--vc-font-medium);
}

.vc-banner__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity var(--vc-transition-fast);
}

.vc-banner__close:hover {
  opacity: 1;
}
</style>
