<template>
  <Teleport to="body">
    <div class="vc-toasts" :class="`vc-toasts--${position}`">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="vc-toast"
          :class="[
            `vc-toast--${toast.type}`,
            { 'vc-toast--dismissible': toast.dismissible }
          ]"
          role="alert"
        >
          <!-- Icon -->
          <span class="vc-toast__icon">
            <VcIcon :name="getIconName(toast.type)" size="md" />
          </span>

          <!-- Content -->
          <div class="vc-toast__content">
            <p v-if="toast.title" class="vc-toast__title">{{ toast.title }}</p>
            <p class="vc-toast__message">{{ toast.message }}</p>
          </div>

          <!-- Actions -->
          <div v-if="toast.action" class="vc-toast__action">
            <button
              class="vc-toast__action-btn"
              @click="handleAction(toast)"
            >
              {{ toast.action.label }}
            </button>
          </div>

          <!-- Close button -->
          <button
            v-if="toast.dismissible !== false"
            class="vc-toast__close"
            @click="$emit('dismiss', toast.id)"
          >
            <VcIcon name="close" size="sm" />
          </button>

          <!-- Progress bar (auto-dismiss) -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="vc-toast__progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import VcIcon from './icons/VcIcon.vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    callback: () => void
  }
}

export interface DiagToastsV2Props {
  toasts: readonly Toast[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export interface DiagToastsV2Emits {
  (e: 'dismiss', id: string): void
}

withDefaults(defineProps<DiagToastsV2Props>(), {
  position: 'top-right'
})

const emit = defineEmits<DiagToastsV2Emits>()

// Methods
function getIconName(type: ToastType): 'success' | 'warning' | 'error' | 'info' {
  switch (type) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    default: return 'info'
  }
}

function handleAction(toast: Toast) {
  toast.action?.callback()
  emit('dismiss', toast.id)
}
</script>

<style scoped>
.vc-toasts {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
  max-width: 400px;
  padding: var(--vc-space-md);
  pointer-events: none;
}

/* Positions */
.vc-toasts--top-right {
  top: 0;
  right: 0;
}

.vc-toasts--top-left {
  top: 0;
  left: 0;
}

.vc-toasts--bottom-right {
  bottom: 0;
  right: 0;
}

.vc-toasts--bottom-left {
  bottom: 0;
  left: 0;
}

.vc-toasts--top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.vc-toasts--bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* Toast */
.vc-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-md);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-md);
  box-shadow: var(--vc-shadow-lg);
  border-left: 4px solid var(--vc-primary);
  overflow: hidden;
  pointer-events: auto;
}

.vc-toast--info {
  border-left-color: var(--vc-primary);
}

.vc-toast--success {
  border-left-color: var(--vc-success);
}

.vc-toast--warning {
  border-left-color: var(--vc-warning);
}

.vc-toast--error {
  border-left-color: var(--vc-danger);
}

/* Icon */
.vc-toast__icon {
  flex-shrink: 0;
  font-size: 18px;
}

/* Content */
.vc-toast__content {
  flex: 1;
  min-width: 0;
}

.vc-toast__title {
  margin: 0 0 var(--vc-space-xs);
  font-size: var(--vc-text-sm);
  font-weight: 600;
  color: var(--vc-text);
}

.vc-toast__message {
  margin: 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
  word-wrap: break-word;
}

/* Action */
.vc-toast__action {
  flex-shrink: 0;
}

.vc-toast__action-btn {
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: none;
  background: transparent;
  color: var(--vc-primary);
  font-size: var(--vc-text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.vc-toast__action-btn:hover {
  opacity: 0.8;
}

/* Close */
.vc-toast__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
  transition: all 0.2s ease;
  font-size: 12px;
}

.vc-toast__close:hover {
  background: var(--vc-bg-hover);
  color: var(--vc-text);
}

/* Progress */
.vc-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: progress linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.vc-toasts--top-left .toast-enter-from,
.vc-toasts--bottom-left .toast-enter-from,
.vc-toasts--top-left .toast-leave-to,
.vc-toasts--bottom-left .toast-leave-to {
  transform: translateX(-100%);
}

.vc-toasts--top-center .toast-enter-from,
.vc-toasts--bottom-center .toast-enter-from {
  transform: translateY(-100%);
}

.vc-toasts--top-center .toast-leave-to,
.vc-toasts--bottom-center .toast-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
