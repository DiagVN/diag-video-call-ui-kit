<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="vc-language-selector__overlay" @click.self="handleClose">
        <div class="vc-language-selector" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="vc-language-selector__header">
            <h2 class="vc-language-selector__title">
              {{ isFirstTime ? $t('vc.title.selectLanguage') : $t('vc.title.changeLanguage') }}
            </h2>
            <p class="vc-language-selector__subtitle">
              {{ $t('vc.message.selectLanguageHint') }}
            </p>
          </div>

          <!-- Language Dropdown -->
          <div class="vc-language-selector__body">
            <label class="vc-language-selector__label" for="language-select">
              {{ $t('vc.label.transcriptLanguage') }}
            </label>
            <select
              id="language-select"
              v-model="internalLanguage"
              class="vc-language-selector__select"
            >
              <option
                v-for="lang in availableLanguages"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
            
            <p class="vc-language-selector__info">
              {{ $t('vc.message.languageInfo') }}
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="vc-language-selector__loading">
            <div class="vc-language-selector__spinner"></div>
            <span>{{ $t('vc.status.startingTranscript') }}</span>
          </div>

          <!-- Footer -->
          <div v-else class="vc-language-selector__footer">
            <button
              type="button"
              class="vc-language-selector__btn vc-language-selector__btn--secondary"
              @click="handleClose"
            >
              {{ $t('vc.action.cancel') }}
            </button>
            <button
              type="button"
              class="vc-language-selector__btn vc-language-selector__btn--primary"
              :disabled="!internalLanguage"
              @click="handleConfirm"
            >
              {{ isFirstTime ? $t('vc.action.startTranscript') : $t('vc.action.apply') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface LanguageOption {
  code: string
  name: string
}

export interface DiagLanguageSelectorV2Props {
  modelValue: boolean
  selectedLanguage?: string
  availableLanguages?: LanguageOption[]
  isFirstTime?: boolean
  isLoading?: boolean
}

export interface DiagLanguageSelectorV2Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', language: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<DiagLanguageSelectorV2Props>(), {
  selectedLanguage: 'en-US',
  isFirstTime: true,
  isLoading: false,
  availableLanguages: () => [
    // Agora STT supported languages
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'vi-VN', name: 'Tiếng Việt' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'zh-HK', name: '中文 (香港)' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'th-TH', name: 'ไทย' },
    { code: 'id-ID', name: 'Bahasa Indonesia' },
    { code: 'ms-MY', name: 'Bahasa Melayu' },
    { code: 'fil-PH', name: 'Filipino' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'es-ES', name: 'Español' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-PT', name: 'Português' },
    { code: 'nl-NL', name: 'Nederlands' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'tr-TR', name: 'Türkçe' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'ar-EG', name: 'العربية (مصر)' },
    { code: 'he-IL', name: 'עברית' },
    { code: 'fa-IR', name: 'فارسی' },
  ]
})

const emit = defineEmits<DiagLanguageSelectorV2Emits>()

// State
const internalLanguage = ref(props.selectedLanguage)

// Sync internal state when prop changes
watch(() => props.selectedLanguage, (newVal) => {
  internalLanguage.value = newVal
})

// Reset when modal opens
watch(() => props.modelValue, (open) => {
  if (open) {
    internalLanguage.value = props.selectedLanguage
  }
})

// Methods
function handleClose() {
  emit('update:modelValue', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm', internalLanguage.value)
}
</script>

<style scoped>
.vc-language-selector__overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.vc-language-selector {
  width: 400px;
  max-width: 90vw;
  background: var(--vc-bg);
  border-radius: var(--vc-radius-lg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* Header */
.vc-language-selector__header {
  padding: var(--vc-space-lg);
  border-bottom: 1px solid var(--vc-border);
}

.vc-language-selector__title {
  margin: 0;
  font-size: var(--vc-text-xl);
  font-weight: 600;
  color: var(--vc-text);
}

.vc-language-selector__subtitle {
  margin: var(--vc-space-xs) 0 0;
  font-size: var(--vc-text-sm);
  color: var(--vc-text-secondary);
}

/* Body */
.vc-language-selector__body {
  padding: var(--vc-space-lg);
}

.vc-language-selector__label {
  display: block;
  margin-bottom: var(--vc-space-sm);
  font-size: var(--vc-text-sm);
  font-weight: 500;
  color: var(--vc-text);
}

/* Native Select */
.vc-language-selector__select {
  width: 100%;
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg-secondary);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  color: var(--vc-text);
  font-size: var(--vc-text-base);
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: auto;
}

.vc-language-selector__select:hover {
  border-color: var(--vc-primary);
}

.vc-language-selector__select:focus {
  outline: none;
  border-color: var(--vc-primary);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.vc-language-selector__select option {
  background: var(--vc-bg);
  color: var(--vc-text);
  padding: var(--vc-space-sm);
}

.vc-language-selector__info {
  margin: var(--vc-space-md) 0 0;
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
  line-height: 1.5;
}

/* Loading */
.vc-language-selector__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-lg);
  color: var(--vc-text-secondary);
  font-size: var(--vc-text-sm);
}

.vc-language-selector__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vc-border);
  border-top-color: var(--vc-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.vc-language-selector__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-md) var(--vc-space-lg);
  border-top: 1px solid var(--vc-border);
}

.vc-language-selector__btn {
  padding: var(--vc-space-sm) var(--vc-space-lg);
  font-size: var(--vc-text-sm);
  font-weight: 500;
  border-radius: var(--vc-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.vc-language-selector__btn--secondary {
  background: transparent;
  border: 1px solid var(--vc-border);
  color: var(--vc-text);
}

.vc-language-selector__btn--secondary:hover {
  background: var(--vc-bg-hover);
}

.vc-language-selector__btn--primary {
  background: var(--vc-primary);
  border: none;
  color: white;
}

.vc-language-selector__btn--primary:hover:not(:disabled) {
  background: var(--vc-primary-hover);
}

.vc-language-selector__btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-active .vc-language-selector,
.fade-leave-active .vc-language-selector {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .vc-language-selector,
.fade-leave-to .vc-language-selector {
  transform: scale(0.95);
  opacity: 0;
}
</style>
