<template>
  <Transition name="banner">
    <div
      v-if="visible"
      class="vc-banner"
      :class="[
        `vc-banner--${type}`,
        `vc-banner--${position}`
      ]"
      role="alert"
    >
      <!-- Icon -->
      <span v-if="showIcon" class="vc-banner__icon">
        <slot name="icon"><VcIcon :name="iconName" size="md" /></slot>
      </span>

      <!-- Content -->
      <div class="vc-banner__content">
        <p v-if="title" class="vc-banner__title">{{ title }}</p>
        <p class="vc-banner__message">
          <slot>{{ message }}</slot>
        </p>
      </div>

      <!-- Actions -->
      <div v-if="$slots.actions || actions.length" class="vc-banner__actions">
        <slot name="actions">
          <button
            v-for="action in actions"
            :key="action.label"
            class="vc-banner__action"
            :class="{ 'vc-banner__action--primary': action.primary }"
            @click="action.callback"
          >
            {{ action.label }}
          </button>
        </slot>
      </div>

      <!-- Dismiss -->
      <button
        v-if="dismissible"
        class="vc-banner__dismiss"
        @click="$emit('dismiss')"
      >
        <VcIcon name="close" size="sm" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VcIcon from './icons/VcIcon.vue'

export type BannerType = 'info' | 'success' | 'warning' | 'error'
export type BannerPosition = 'top' | 'bottom' | 'inline'

export interface BannerAction {
  label: string
  callback: () => void
  primary?: boolean
}

export interface DiagBannerV2Props {
  visible?: boolean
  type?: BannerType
  position?: BannerPosition
  title?: string
  message?: string
  showIcon?: boolean
  dismissible?: boolean
  actions?: BannerAction[]
}

export interface DiagBannerV2Emits {
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<DiagBannerV2Props>(), {
  visible: true,
  type: 'info',
  position: 'top',
  title: '',
  message: '',
  showIcon: true,
  dismissible: true,
  actions: () => []
})

defineEmits<DiagBannerV2Emits>()

// Computed
const iconName = computed((): 'success' | 'warning' | 'error' | 'info' => {
  switch (props.type) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    default: return 'info'
  }
})
</script>

<style scoped>
.vc-banner {
  display: flex;
  align-items: center;
  gap: var(--vc-space-md);
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg);
  border: 1px solid var(--vc-border);
}

/* Types */
.vc-banner--info {
  background: rgba(52, 152, 219, 0.1);
  border-color: var(--vc-primary);
  color: var(--vc-primary);
}

.vc-banner--success {
  background: rgba(39, 174, 96, 0.1);
  border-color: var(--vc-success);
  color: var(--vc-success);
}

.vc-banner--warning {
  background: rgba(241, 196, 15, 0.1);
  border-color: var(--vc-warning);
  color: #856404;
}

.vc-banner--error {
  background: rgba(231, 76, 60, 0.1);
  border-color: var(--vc-danger);
  color: var(--vc-danger);
}

/* Positions */
.vc-banner--top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: none;
  border-left: none;
  border-right: none;
}

.vc-banner--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: none;
  border-left: none;
  border-right: none;
}

.vc-banner--inline {
  border-radius: var(--vc-radius-md);
}

/* Icon */
.vc-banner__icon {
  flex-shrink: 0;
  font-size: 18px;
}

/* Content */
.vc-banner__content {
  flex: 1;
  min-width: 0;
}

.vc-banner__title {
  margin: 0;
  font-size: var(--vc-text-sm);
  font-weight: 600;
  color: inherit;
}

.vc-banner__message {
  margin: 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text);
}

/* Actions */
.vc-banner__actions {
  display: flex;
  gap: var(--vc-space-sm);
  flex-shrink: 0;
}

.vc-banner__action {
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-banner__action:hover {
  opacity: 0.8;
}

.vc-banner__action--primary {
  background: currentColor;
  color: white;
}

/* Dismiss */
.vc-banner__dismiss {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
  opacity: 0.6;
  transition: opacity 0.2s ease;
  font-size: 12px;
}

.vc-banner__dismiss:hover {
  opacity: 1;
}

/* Transitions */
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}

.vc-banner--top.banner-enter-from,
.vc-banner--top.banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.vc-banner--bottom.banner-enter-from,
.vc-banner--bottom.banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.vc-banner--inline.banner-enter-from,
.vc-banner--inline.banner-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
