<template>
  <Teleport to="body">
    <div class="vc-toasts">
      <TransitionGroup name="vc-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="vc-toast"
          :class="`vc-toast--${toast.type}`"
          role="alert"
        >
          <div class="vc-toast__icon">
            <svg
              v-if="toast.type === 'success'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warn'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>

          <div class="vc-toast__content">
            <div class="vc-toast__message">{{ $t(toast.messageKey) }}</div>
          </div>

          <button class="vc-toast__close" @click="$emit('dismiss', toast.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastMessage } from '@diag/video-call-core'

export interface DiagToastsProps {
  toasts: ToastMessage[]
}

export interface DiagToastsEmits {
  (event: 'dismiss', id: string): void
}

defineProps<DiagToastsProps>()
defineEmits<DiagToastsEmits>()
</script>

<style>
.vc-toasts {
  position: fixed;
  top: var(--vc-space-xl);
  right: var(--vc-space-xl);
  z-index: var(--vc-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
  pointer-events: none;
}

.vc-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--vc-space-md);
  min-width: 320px;
  max-width: 420px;
  padding: var(--vc-space-lg);
  background: var(--vc-surface);
  border: 1px solid var(--vc-border);
  border-left: 4px solid var(--vc-primary);
  border-radius: var(--vc-radius-sm);
  box-shadow: var(--vc-shadow);
  pointer-events: auto;
}

.vc-toast--success {
  border-left-color: var(--vc-success);
}

.vc-toast--error {
  border-left-color: var(--vc-danger);
}

.vc-toast--warn {
  border-left-color: var(--vc-warn);
}

.vc-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--vc-primary);
}

.vc-toast--success .vc-toast__icon {
  color: var(--vc-success);
}

.vc-toast--error .vc-toast__icon {
  color: var(--vc-danger);
}

.vc-toast--warn .vc-toast__icon {
  color: var(--vc-warn);
}

.vc-toast__content {
  flex: 1;
}

.vc-toast__message {
  color: var(--vc-fg);
  font-size: var(--vc-text-sm);
  line-height: var(--vc-line-normal);
}

.vc-toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vc-fg-muted);
  cursor: pointer;
  transition: color var(--vc-transition-fast);
}

.vc-toast__close:hover {
  color: var(--vc-fg);
}

/* Transitions */
.vc-toast-enter-active,
.vc-toast-leave-active {
  transition: all var(--vc-transition-base);
}

.vc-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.vc-toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>
