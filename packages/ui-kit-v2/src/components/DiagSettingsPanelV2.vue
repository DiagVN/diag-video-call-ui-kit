<template>
  <div class="vc-settings-panel">
    <!-- Header -->
    <div class="vc-settings-panel__header">
      <h3 class="vc-settings-panel__title">{{ $t('vc.title.settings') }}</h3>
      <button class="vc-settings-panel__close" @click="$emit('close')">
        <VcIcon name="close" size="sm" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="vc-settings-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="vc-settings-panel__tab"
        :class="{ 'vc-settings-panel__tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="vc-settings-panel__content">
      <!-- Audio settings -->
      <div v-if="activeTab === 'audio'" class="vc-settings-panel__section">
        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.microphone') }}</label>
          <select
            :value="selectedAudioInput"
            class="vc-settings-panel__select"
            @change="$emit('change-audio-input', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="device in audioInputDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Microphone ${device.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.speaker') }}</label>
          <select
            :value="selectedAudioOutput"
            class="vc-settings-panel__select"
            @change="$emit('change-audio-output', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="device in audioOutputDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Speaker ${device.deviceId.slice(0, 8)}` }}
            </option>
          </select>
          <button class="vc-settings-panel__test-btn" @click="$emit('test-speaker')">
            {{ $t('vc.action.testSpeaker') }}
          </button>
        </div>

        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.microphoneLevel') }}</label>
          <div class="vc-settings-panel__level">
            <div class="vc-settings-panel__level-bar" :style="{ width: `${audioLevel * 100}%` }" />
          </div>
        </div>

        <!-- Noise suppression -->
        <div v-if="features.noiseSuppression" class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.noiseSuppression') }}</label>
          <div class="vc-settings-panel__radio-group">
            <label v-for="level in noiseSuppressionLevels" :key="level.value" class="vc-settings-panel__radio">
              <input
                type="radio"
                name="noiseSuppression"
                :value="level.value"
                :checked="noiseSuppressionLevel === level.value"
                @change="$emit('change-noise-suppression', level.value as NoiseSuppressionLevel)"
              />
              {{ level.label }}
            </label>
          </div>
        </div>
      </div>

      <!-- Video settings -->
      <div v-if="activeTab === 'video'" class="vc-settings-panel__section">
        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.camera') }}</label>
          <select
            :value="selectedVideoInput"
            class="vc-settings-panel__select"
            @change="$emit('change-video-input', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="device in videoInputDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Camera ${device.deviceId.slice(0, 8)}` }}
            </option>
          </select>
        </div>

        <!-- Camera preview -->
        <div class="vc-settings-panel__preview">
          <div ref="previewRef" class="vc-settings-panel__preview-video" />
          <div v-if="!renderer" class="vc-settings-panel__preview-placeholder">
            <VcIcon name="camera-off" size="lg" />
            <span>{{ $t('vc.message.noPreview') }}</span>
          </div>
        </div>

        <!-- Video quality -->
        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.videoQuality') }}</label>
          <select
            :value="videoQuality"
            class="vc-settings-panel__select"
            @change="$emit('change-video-quality', ($event.target as HTMLSelectElement).value)"
          >
            <option value="auto">Auto</option>
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="480p">480p SD</option>
            <option value="360p">360p Low</option>
          </select>
        </div>

        <!-- Mirror video -->
        <div class="vc-settings-panel__group vc-settings-panel__group--inline">
          <label class="vc-settings-panel__label">{{ $t('vc.label.mirrorVideo') }}</label>
          <input
            type="checkbox"
            :checked="mirrorVideo"
            @change="$emit('change-mirror-video', ($event.target as HTMLInputElement).checked)"
          />
        </div>
      </div>

      <!-- Virtual background -->
      <div v-if="activeTab === 'background'" class="vc-settings-panel__section">
        <!-- Video preview with virtual background effect -->
        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.preview') }}</label>
          <div class="vc-settings-panel__preview">
            <div 
              ref="bgPreviewRef" 
              class="vc-settings-panel__preview-video"
            />
            <div v-if="!renderer" class="vc-settings-panel__preview-placeholder">
              <VcIcon name="camera-off" size="lg" />
              <span>{{ $t('vc.message.noPreview') }}</span>
            </div>
          </div>
        </div>

        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.virtualBackground') }}</label>
          <div class="vc-settings-panel__backgrounds">
            <!-- None -->
            <button
              class="vc-settings-panel__bg-option"
              :class="{ 'vc-settings-panel__bg-option--active': !virtualBackgroundType || virtualBackgroundType === 'none' }"
              @click="$emit('change-virtual-background', { type: 'none' })"
            >
              <VcIcon name="blocked" size="md" class="vc-settings-panel__bg-icon" />
              <span>{{ $t('vc.option.none') }}</span>
            </button>

            <!-- Blur -->
            <button
              class="vc-settings-panel__bg-option"
              :class="{ 'vc-settings-panel__bg-option--active': virtualBackgroundType === 'blur' }"
              @click="$emit('change-virtual-background', { type: 'blur', blurStrength: 50 })"
            >
              <VcIcon name="blur" size="md" class="vc-settings-panel__bg-icon" />
              <span>{{ $t('vc.option.blur') }}</span>
            </button>

            <!-- Preset images -->
            <button
              v-for="bg in allPresetBackgrounds"
              :key="bg.id"
              class="vc-settings-panel__bg-option vc-settings-panel__bg-option--image"
              :class="{ 'vc-settings-panel__bg-option--active': virtualBackgroundUrl === bg.url }"
              :style="{ backgroundImage: `url(${bg.thumbnail})` }"
              :title="bg.name"
              @click="$emit('change-virtual-background', { type: 'image', imageUrl: bg.url })"
            />

            <!-- Custom upload -->
            <button
              class="vc-settings-panel__bg-option"
              @click="triggerBackgroundUpload"
            >
              <span class="vc-settings-panel__bg-icon">➕</span>
              <span>{{ $t('vc.action.upload') }}</span>
            </button>
          </div>
          <input
            ref="bgFileInputRef"
            type="file"
            accept="image/jpeg,image/png"
            hidden
            @change="handleBackgroundUpload"
          />
          <!-- File upload error message -->
          <p v-if="uploadError" class="vc-settings-panel__error">{{ uploadError }}</p>
        </div>

        <!-- Blur level (when blur is selected) -->
        <div v-if="virtualBackgroundType === 'blur'" class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.blurLevel') }} ({{ virtualBackgroundConfig?.blurStrength ?? 50 }})</label>
          <input
            type="range"
            min="0"
            max="100"
            :value="virtualBackgroundConfig?.blurStrength ?? 50"
            class="vc-settings-panel__slider"
            @input="$emit('change-virtual-background', { type: 'blur', blurStrength: Number(($event.target as HTMLInputElement).value) })"
          />
        </div>

        <!-- Apply button for virtual background -->
        <div v-if="virtualBackgroundType && virtualBackgroundType !== 'none'" class="vc-settings-panel__group vc-settings-panel__group--actions">
          <button
            class="vc-settings-panel__apply-btn"
            @click="handleApplyVirtualBackground"
          >
            {{ $t('vc.action.apply') || 'Apply' }}
          </button>
        </div>
      </div>

      <!-- Beauty effects -->
      <div v-if="activeTab === 'beauty' && features.beautyEffects" class="vc-settings-panel__section">
        <div class="vc-settings-panel__group vc-settings-panel__group--inline">
          <label class="vc-settings-panel__label">{{ $t('vc.label.enableBeauty') }}</label>
          <input
            type="checkbox"
            :checked="beautyEnabled"
            @change="$emit('change-beauty-enabled', ($event.target as HTMLInputElement).checked)"
          />
        </div>

        <template v-if="beautyEnabled">
          <div class="vc-settings-panel__group">
            <label class="vc-settings-panel__label">{{ $t('vc.label.smoothing') }} ({{ beautyOptions.smoothness }})</label>
            <input
              type="range"
              min="0"
              max="100"
              :value="beautyOptions.smoothness"
              class="vc-settings-panel__slider"
              @input="$emit('change-beauty-option', { ...beautyOptions, smoothness: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>

          <div class="vc-settings-panel__group">
            <label class="vc-settings-panel__label">{{ $t('vc.label.lightening') }} ({{ beautyOptions.lightening }})</label>
            <input
              type="range"
              min="0"
              max="100"
              :value="beautyOptions.lightening"
              class="vc-settings-panel__slider"
              @input="$emit('change-beauty-option', { ...beautyOptions, lightening: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>

          <div class="vc-settings-panel__group">
            <label class="vc-settings-panel__label">{{ $t('vc.label.redness') }} ({{ beautyOptions.redness }})</label>
            <input
              type="range"
              min="0"
              max="100"
              :value="beautyOptions.redness"
              class="vc-settings-panel__slider"
              @input="$emit('change-beauty-option', { ...beautyOptions, redness: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>

          <div class="vc-settings-panel__group">
            <label class="vc-settings-panel__label">{{ $t('vc.label.sharpness') }} ({{ beautyOptions.sharpness }})</label>
            <input
              type="range"
              min="0"
              max="100"
              :value="beautyOptions.sharpness"
              class="vc-settings-panel__slider"
              @input="$emit('change-beauty-option', { ...beautyOptions, sharpness: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>

          <!-- Contrast Level -->
          <div class="vc-settings-panel__group">
            <label class="vc-settings-panel__label">{{ $t('vc.label.contrastLevel') }}</label>
            <div class="vc-settings-panel__radio-group">
              <label class="vc-settings-panel__radio">
                <input
                  type="radio"
                  name="contrast"
                  :checked="beautyOptions.contrastLevel === 0"
                  @change="$emit('change-beauty-option', { ...beautyOptions, contrastLevel: 0 })"
                />
                {{ $t('vc.option.low') }}
              </label>
              <label class="vc-settings-panel__radio">
                <input
                  type="radio"
                  name="contrast"
                  :checked="beautyOptions.contrastLevel === 1 || beautyOptions.contrastLevel === undefined"
                  @change="$emit('change-beauty-option', { ...beautyOptions, contrastLevel: 1 })"
                />
                {{ $t('vc.option.normal') }}
              </label>
              <label class="vc-settings-panel__radio">
                <input
                  type="radio"
                  name="contrast"
                  :checked="beautyOptions.contrastLevel === 2"
                  @change="$emit('change-beauty-option', { ...beautyOptions, contrastLevel: 2 })"
                />
                {{ $t('vc.option.high') }}
              </label>
            </div>
          </div>
        </template>
      </div>

      <!-- General settings -->
      <div v-if="activeTab === 'general'" class="vc-settings-panel__section">
        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.language') }}</label>
          <select
            :value="language"
            class="vc-settings-panel__select"
            @change="$emit('change-language', ($event.target as HTMLSelectElement).value)"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>

        <div class="vc-settings-panel__group">
          <label class="vc-settings-panel__label">{{ $t('vc.label.theme') }}</label>
          <select
            :value="theme"
            class="vc-settings-panel__select"
            @change="$emit('change-theme', ($event.target as HTMLSelectElement).value)"
          >
            <option value="light">{{ $t('vc.option.light') }}</option>
            <option value="dark">{{ $t('vc.option.dark') }}</option>
            <option value="system">{{ $t('vc.option.system') }}</option>
          </select>
        </div>

        <div class="vc-settings-panel__group vc-settings-panel__group--inline">
          <label class="vc-settings-panel__label">{{ $t('vc.label.notifications') }}</label>
          <input
            type="checkbox"
            :checked="notificationsEnabled"
            @change="$emit('change-notifications', ($event.target as HTMLInputElement).checked)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { 
  FeatureFlags, 
  VirtualBackgroundConfig, 
  BeautyEffectOptions,
  NoiseSuppressionLevel,
  VideoRenderer
} from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

interface DeviceInfo {
  deviceId: string
  label: string
}

interface PresetBackground {
  id: string
  name?: string
  url: string
  thumbnail: string
}

export type SettingsTab = 'audio' | 'video' | 'background' | 'beauty' | 'general'

export interface DiagSettingsPanelV2Props {
  // Devices
  audioInputDevices?: readonly DeviceInfo[]
  audioOutputDevices?: readonly DeviceInfo[]
  videoInputDevices?: readonly DeviceInfo[]
  selectedAudioInput?: string
  selectedAudioOutput?: string
  selectedVideoInput?: string
  audioLevel?: number
  
  // Video settings
  videoQuality?: string
  mirrorVideo?: boolean
  renderer?: VideoRenderer | null
  
  // Virtual background
  virtualBackgroundType?: 'none' | 'blur' | 'image' | null
  virtualBackgroundUrl?: string
  virtualBackgroundConfig?: VirtualBackgroundConfig | null
  blurLevel?: 'low' | 'medium' | 'high'
  presetBackgrounds?: readonly PresetBackground[]
  
  // Beauty effects
  beautyEnabled?: boolean
  beautyOptions?: BeautyEffectOptions
  
  // Noise suppression
  noiseSuppressionLevel?: NoiseSuppressionLevel
  
  // General
  language?: string
  theme?: 'light' | 'dark' | 'system'
  notificationsEnabled?: boolean
  
  // Features
  features?: Partial<FeatureFlags>
  
  // Initial tab to show
  initialTab?: SettingsTab
}

export interface DiagSettingsPanelV2Emits {
  (e: 'close'): void
  (e: 'change-audio-input', deviceId: string): void
  (e: 'change-audio-output', deviceId: string): void
  (e: 'change-video-input', deviceId: string): void
  (e: 'test-speaker'): void
  (e: 'change-noise-suppression', level: NoiseSuppressionLevel): void
  (e: 'change-video-quality', quality: string): void
  (e: 'change-mirror-video', mirror: boolean): void
  (e: 'change-virtual-background', config: Partial<VirtualBackgroundConfig>): void
  (e: 'apply-virtual-background'): void
  (e: 'change-beauty-enabled', enabled: boolean): void
  (e: 'change-beauty-option', options: BeautyEffectOptions): void
  (e: 'change-language', language: string): void
  (e: 'change-theme', theme: string): void
  (e: 'change-notifications', enabled: boolean): void
}

const props = withDefaults(defineProps<DiagSettingsPanelV2Props>(), {
  audioInputDevices: () => [],
  audioOutputDevices: () => [],
  videoInputDevices: () => [],
  selectedAudioInput: '',
  selectedAudioOutput: '',
  selectedVideoInput: '',
  audioLevel: 0,
  videoQuality: 'auto',
  mirrorVideo: true,
  virtualBackgroundType: null,
  virtualBackgroundUrl: '',
  virtualBackgroundConfig: null,
  blurLevel: 'medium',
  presetBackgrounds: () => [],
  beautyEnabled: false,
  beautyOptions: () => ({ enabled: false, smoothness: 50, lightening: 30, redness: 10, sharpness: 30 }),
  noiseSuppressionLevel: 'off',
  language: 'en',
  theme: 'system',
  notificationsEnabled: true,
  features: () => ({
    virtualBackground: true,
    beautyEffects: true,
    noiseSuppression: true
  }),
  initialTab: 'audio'
})

const emit = defineEmits<DiagSettingsPanelV2Emits>()

// Refs
const bgFileInputRef = ref<HTMLInputElement | null>(null)
const bgPreviewRef = ref<HTMLDivElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)

// State
const activeTab = ref<SettingsTab>(props.initialTab || 'audio')
const uploadError = ref<string | null>(null)
const customBackgrounds = ref<PresetBackground[]>([])
const isPreviewAttached = ref(false)

// Default preset backgrounds
const DEFAULT_PRESET_BACKGROUNDS: PresetBackground[] = [
  { id: 'bg-bookshelf', name: 'Bookshelf', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=120&fit=crop' },
  { id: 'bg-beach', name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop' },
  { id: 'bg-office', name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=120&fit=crop' },
  { id: 'bg-nature', name: 'Nature', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=120&fit=crop' },
  { id: 'bg-city', name: 'City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&h=120&fit=crop' },
  { id: 'bg-mountains', name: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=120&fit=crop' },
  { id: 'bg-abstract', name: 'Abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=120&fit=crop' },
  { id: 'bg-living-room', name: 'Living Room', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=120&fit=crop' },
  { id: 'bg-plants', name: 'Plants', url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1920&h=1080&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=120&fit=crop' }
]

// Watch for initialTab changes (when opening from different buttons)
watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
})

// Attach/detach video preview when switching to/from video or background tabs
const attachVideoPreview = async () => {
  await nextTick()
  
  if (!props.renderer) return
  
  // Attach to background preview - use VB preview if available
  if (activeTab.value === 'background' && bgPreviewRef.value) {
    // Try to use attachPreviewWithVB for VB-enabled preview
    if (props.renderer.attachPreviewWithVB) {
      await props.renderer.attachPreviewWithVB(bgPreviewRef.value)
      isPreviewAttached.value = true
    } else if (props.renderer.attachPreview) {
      props.renderer.attachPreview(bgPreviewRef.value, 'camera')
      isPreviewAttached.value = true
    }
  }
  // Attach to video preview - use normal preview
  else if (activeTab.value === 'video' && previewRef.value) {
    if (props.renderer.attachPreview) {
      props.renderer.attachPreview(previewRef.value, 'camera')
      isPreviewAttached.value = true
    }
  }
}

const detachVideoPreview = () => {
  if (!props.renderer || !isPreviewAttached.value) return
  
  if (props.renderer.detachPreview) {
    if (bgPreviewRef.value) {
      props.renderer.detachPreview(bgPreviewRef.value)
    }
    if (previewRef.value) {
      props.renderer.detachPreview(previewRef.value)
    }
  }
  isPreviewAttached.value = false
}

// Watch for tab changes to manage video preview
watch(activeTab, async (newTab, oldTab) => {
  // Detach from old preview container
  if (oldTab === 'video' || oldTab === 'background') {
    detachVideoPreview()
  }
  
  // Attach to new preview container
  if (newTab === 'video' || newTab === 'background') {
    await attachVideoPreview()
  }
})

// Watch for renderer changes
watch(() => props.renderer, async (newRenderer) => {
  if (newRenderer && (activeTab.value === 'video' || activeTab.value === 'background')) {
    await attachVideoPreview()
  }
})

// Watch for virtual background changes to refresh preview with VB
watch(() => props.virtualBackgroundConfig, async () => {
  // When VB config changes, refresh the preview using attachPreviewWithVB
  if (activeTab.value === 'background' && bgPreviewRef.value && props.renderer) {
    await nextTick()
    
    // Small delay to let VB processor update
    setTimeout(async () => {
      if (bgPreviewRef.value) {
        console.log('[SettingsPanel] VB changed, refreshing preview with VB')
        bgPreviewRef.value.innerHTML = ''
        
        // Use attachPreviewWithVB if available (for VB preview), otherwise fallback to attachPreview
        if (props.renderer?.attachPreviewWithVB) {
          await props.renderer.attachPreviewWithVB(bgPreviewRef.value)
        } else if (props.renderer?.attachPreview) {
          props.renderer.attachPreview(bgPreviewRef.value, 'camera')
        }
      }
    }, 200)
  }
}, { deep: true })

// Mount/unmount lifecycle
onMounted(async () => {
  if (activeTab.value === 'video' || activeTab.value === 'background') {
    await attachVideoPreview()
  }
})

onUnmounted(() => {
  detachVideoPreview()
})

// Computed
const tabs = computed(() => {
  const list: { id: SettingsTab; label: string }[] = [
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Video' }
  ]
  if (props.features.virtualBackground) {
    list.push({ id: 'background', label: 'Background' })
  }
  if (props.features.beautyEffects) {
    list.push({ id: 'beauty', label: 'Beauty' })
  }
  list.push({ id: 'general', label: 'General' })
  return list
})

const noiseSuppressionLevels = [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

// Merge default presets with prop presets and custom uploads
const allPresetBackgrounds = computed(() => {
  const propBackgrounds = props.presetBackgrounds || []
  // Use prop backgrounds if provided, otherwise use defaults + custom uploads
  if (propBackgrounds.length > 0) {
    return [...propBackgrounds, ...customBackgrounds.value]
  }
  return [...DEFAULT_PRESET_BACKGROUNDS, ...customBackgrounds.value]
})

// File validation constants
const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png']

// Methods
function triggerBackgroundUpload() {
  uploadError.value = null
  bgFileInputRef.value?.click()
}

function handleBackgroundUpload(event: Event) {
  const input = event.target as HTMLInputElement
  uploadError.value = null
  
  if (input.files && input.files[0]) {
    const file = input.files[0]
    
    // File type validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      uploadError.value = 'Only JPEG and PNG images are allowed'
      input.value = ''
      return
    }
    
    // File size validation (1MB limit)
    if (file.size > MAX_FILE_SIZE) {
      uploadError.value = 'Image must be less than 1MB'
      input.value = ''
      return
    }
    
    const imageUrl = URL.createObjectURL(file)
    
    // Check for duplicate uploads
    const isDuplicate = customBackgrounds.value.some(bg => bg.url === imageUrl)
    if (isDuplicate) {
      uploadError.value = 'This image has already been uploaded'
      URL.revokeObjectURL(imageUrl)
      input.value = ''
      return
    }
    
    // Add to custom backgrounds
    const newBg: PresetBackground = {
      id: `custom-${Date.now()}`,
      name: file.name,
      url: imageUrl,
      thumbnail: imageUrl
    }
    customBackgrounds.value.push(newBg)
    
    // Apply the new background
    emit('change-virtual-background', { type: 'image', imageUrl })
    input.value = ''
  }
}

// Handle Apply button click - emit event and refresh preview
const handleApplyVirtualBackground = async () => {
  emit('apply-virtual-background')
  
  // Refresh the preview after a short delay to ensure the VB is applied
  await nextTick()
  setTimeout(() => {
    if (bgPreviewRef.value && props.renderer?.attachPreview) {
      console.log('[SettingsPanel] Refreshing preview after VB apply')
      // Clear and re-attach preview
      bgPreviewRef.value.innerHTML = ''
      props.renderer.attachPreview(bgPreviewRef.value, 'camera')
    }
  }, 100)
}
</script>

<style scoped>
.vc-settings-panel {
  display: flex;
  flex-direction: column;
  width: 400px;
  max-width: 100%;
  height: 100%;
  background: var(--vc-bg);
  border-left: 1px solid var(--vc-border);
}

/* Header */
.vc-settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-md);
  border-bottom: 1px solid var(--vc-border);
}

.vc-settings-panel__title {
  margin: 0;
  font-size: var(--vc-text-md);
  font-weight: 600;
}

.vc-settings-panel__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
}

.vc-settings-panel__close:hover {
  background: var(--vc-bg-hover);
}

/* Tabs */
.vc-settings-panel__tabs {
  display: flex;
  gap: var(--vc-space-xs);
  padding: var(--vc-space-sm) var(--vc-space-md);
  border-bottom: 1px solid var(--vc-border);
  overflow-x: auto;
}

.vc-settings-panel__tab {
  padding: var(--vc-space-sm) var(--vc-space-md);
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  font-size: var(--vc-text-sm);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.vc-settings-panel__tab:hover {
  background: var(--vc-bg-hover);
}

.vc-settings-panel__tab--active {
  background: var(--vc-primary);
  color: white;
}

/* Content */
.vc-settings-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--vc-space-md);
}

/* Section */
.vc-settings-panel__section {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-lg);
}

/* Group */
.vc-settings-panel__group {
  display: flex;
  flex-direction: column;
  gap: var(--vc-space-sm);
}

.vc-settings-panel__group--inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.vc-settings-panel__label {
  font-size: var(--vc-text-sm);
  font-weight: 500;
  color: var(--vc-text);
}

/* Select */
.vc-settings-panel__select {
  padding: var(--vc-space-sm) var(--vc-space-md);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
}

.vc-settings-panel__select:focus {
  outline: none;
  border-color: var(--vc-primary);
}

/* Test button */
.vc-settings-panel__test-btn {
  align-self: flex-start;
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  background: transparent;
  color: var(--vc-text);
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-xs);
  cursor: pointer;
}

.vc-settings-panel__test-btn:hover {
  background: var(--vc-bg-hover);
}

/* Level indicator */
.vc-settings-panel__level {
  height: 8px;
  background: var(--vc-bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.vc-settings-panel__level-bar {
  height: 100%;
  background: var(--vc-success);
  transition: width 0.1s ease;
}

/* Radio group */
.vc-settings-panel__radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vc-space-md);
}

.vc-settings-panel__radio {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  font-size: var(--vc-text-sm);
  cursor: pointer;
}

/* Preview */
.vc-settings-panel__preview {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-md);
  overflow: hidden;
}

.vc-settings-panel__preview-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.vc-settings-panel__preview-video :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.vc-settings-panel__preview-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--vc-space-sm);
  color: var(--vc-text-secondary);
  font-size: var(--vc-text-sm);
  background: var(--vc-bg-secondary);
}

/* Slider */
.vc-settings-panel__slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--vc-bg-secondary);
  border-radius: 3px;
  cursor: pointer;
}

.vc-settings-panel__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--vc-primary);
  border-radius: 50%;
  cursor: pointer;
}

/* Backgrounds grid */
.vc-settings-panel__backgrounds {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--vc-space-sm);
}

.vc-settings-panel__bg-option {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--vc-space-xs);
  border: 2px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-bg-secondary);
  cursor: pointer;
  font-size: var(--vc-text-xs);
  transition: all 0.2s ease;
}

.vc-settings-panel__bg-option:hover {
  border-color: var(--vc-primary);
}

.vc-settings-panel__bg-option--active {
  border-color: var(--vc-primary);
  background: rgba(var(--vc-primary-rgb, 52, 152, 219), 0.1);
}

.vc-settings-panel__bg-option--image {
  background-size: cover;
  background-position: center;
}

.vc-settings-panel__bg-icon {
  font-size: 20px;
}

/* Error message */
.vc-settings-panel__error {
  margin: var(--vc-space-xs) 0 0;
  padding: var(--vc-space-xs) var(--vc-space-sm);
  font-size: var(--vc-text-xs);
  color: var(--vc-error, #e74c3c);
  background: rgba(231, 76, 60, 0.1);
  border-radius: var(--vc-radius-sm);
}

/* Actions group */
.vc-settings-panel__group--actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--vc-space-md);
  padding-top: var(--vc-space-md);
  border-top: 1px solid var(--vc-border);
}

/* Apply button */
.vc-settings-panel__apply-btn {
  padding: var(--vc-space-sm) var(--vc-space-lg);
  background: var(--vc-primary, #3498db);
  color: white;
  border: none;
  border-radius: var(--vc-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.vc-settings-panel__apply-btn:hover {
  background: var(--vc-primary-hover, #2980b9);
}

.vc-settings-panel__apply-btn:active {
  transform: scale(0.98);
}
</style>
