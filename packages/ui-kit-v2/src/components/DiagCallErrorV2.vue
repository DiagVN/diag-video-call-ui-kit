<template>
  <div class="vc-call-error">
    <div class="vc-call-error__icon"><VcIcon name="warning" size="xl" /></div>
    <h2 class="vc-call-error__title">{{ title || $t('vc.error.title') }}</h2>
    <p class="vc-call-error__message">{{ message || error?.message || $t('vc.error.generic') }}</p>
    
    <div v-if="error?.code" class="vc-call-error__code">
      {{ $t('vc.error.code') }}: {{ error.code }}
    </div>
    
    <div class="vc-call-error__actions">
      <button 
        v-if="showRetry"
        class="vc-btn vc-btn-primary"
        @click="$emit('retry')"
      >
        {{ $t('vc.action.retry') }}
      </button>
      
      <button 
        class="vc-btn vc-btn-secondary"
        @click="$emit('dismiss')"
      >
        {{ dismissLabel || $t('vc.action.dismiss') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CallError } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface DiagCallErrorV2Props {
  error?: CallError | null
  title?: string
  message?: string
  showRetry?: boolean
  dismissLabel?: string
}

export interface DiagCallErrorV2Emits {
  (e: 'retry'): void
  (e: 'dismiss'): void
}

withDefaults(defineProps<DiagCallErrorV2Props>(), {
  showRetry: true
})

defineEmits<DiagCallErrorV2Emits>()
</script>

<style scoped>
.vc-call-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 300px;
  background: var(--vc-bg-primary, #ffffff);
  border-radius: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.vc-call-error__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.vc-call-error__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vc-text-primary, #1f2937);
  margin: 0 0 0.5rem 0;
}

.vc-call-error__message {
  color: var(--vc-text-secondary, #6b7280);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.vc-call-error__code {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--vc-text-muted, #9ca3af);
  background: var(--vc-bg-secondary, #f3f4f6);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.vc-call-error__actions {
  display: flex;
  gap: 0.75rem;
}

.vc-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.vc-btn-primary {
  background: var(--vc-primary, #3b82f6);
  color: white;
}

.vc-btn-primary:hover {
  background: var(--vc-primary-hover, #2563eb);
}

.vc-btn-secondary {
  background: var(--vc-bg-secondary, #f3f4f6);
  color: var(--vc-text-primary, #1f2937);
}

.vc-btn-secondary:hover {
  background: var(--vc-bg-tertiary, #e5e7eb);
}
</style>
