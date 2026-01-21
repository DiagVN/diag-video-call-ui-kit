<template>
  <div class="prejoin-view">
    <!-- Mode Selector -->
    <div class="prejoin-view__mode-selector">
      <button
        :class="['mode-btn', { active: mode === 'mock' }]"
        @click="mode = 'mock'"
      >
        Mock Mode
      </button>
      <button
        :class="['mode-btn', { active: mode === 'agora' }]"
        @click="mode = 'agora'"
      >
        Agora Mode
      </button>
    </div>

    <DiagPreJoinPanel
      ref="prejoinRef"
      :devices="devices"
      :has-video-preview="mode === 'agora' && hasVideoPreview"
      @join="handleJoin"
      @device-change="handleDeviceChange"
      @language-change="handleLanguageChange"
    />
  </div>
</template>

<script setup lang="ts">
/// <reference types="vite/client" />
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import { DiagPreJoinPanel } from '@diag/video-call-ui-kit'
import { createAgoraAdapter } from '@diag/agora-web-adapter'
import type { Devices } from '@diag/video-call-core'
import AgoraRTC, { type ILocalVideoTrack } from 'agora-rtc-sdk-ng'

const router = useRouter()
const { locale } = useI18n()
const store = useVideoCallStore()

const prejoinRef = ref<InstanceType<typeof DiagPreJoinPanel> | null>(null)

const mode = ref<'mock' | 'agora'>((import.meta.env.VITE_DEFAULT_MODE as 'mock' | 'agora') || 'mock')
const devices = ref<Devices>({
  microphones: [],
  cameras: [],
  speakers: []
})
const hasVideoPreview = ref(false)
let previewTrack: ILocalVideoTrack | null = null

onMounted(async () => {
  if (mode.value === 'agora') {
    await initAgoraMode()
  } else {
    await initMockMode()
  }
})

watch(mode, async newMode => {
  if (newMode === 'agora') {
    await initAgoraMode()
  } else {
    await initMockMode()
  }
})

async function initMockMode() {
  // Mock devices
  await stopPreview()
  devices.value = {
    microphones: [
      { deviceId: 'mock-mic-1', label: 'Mock Microphone 1', kind: 'audioinput' },
      { deviceId: 'mock-mic-2', label: 'Mock Microphone 2', kind: 'audioinput' }
    ],
    cameras: [
      { deviceId: 'mock-cam-1', label: 'Mock Camera 1', kind: 'videoinput' },
      { deviceId: 'mock-cam-2', label: 'Mock Camera 2', kind: 'videoinput' }
    ],
    speakers: [
      { deviceId: 'mock-speaker-1', label: 'Mock Speaker 1', kind: 'audiooutput' }
    ],
    selectedMic: 'mock-mic-1',
    selectedCam: 'mock-cam-1',
    selectedSpeaker: 'mock-speaker-1'
  }
}

async function initAgoraMode() {
  const appId = import.meta.env.VITE_AGORA_APP_ID
  
  if (!appId) {
    console.error('VITE_AGORA_APP_ID not set. Please set it in .env.local')
    mode.value = 'mock'
    await initMockMode()
    return
  }

  try {
    const eventBus = createEventBus()
    const adapter = createAgoraAdapter({ appId, eventBus, debug: true })
    
    store.setAdapter(adapter)
    await store.init()
    
    devices.value = await adapter.getDevices()
    if (!devices.value.selectedCam && devices.value.cameras[0]) {
      devices.value.selectedCam = devices.value.cameras[0].deviceId
    }
    await startPreview(selectedCameraId())
  } catch (error) {
    console.error('Failed to initialize Agora:', error)
    mode.value = 'mock'
    await initMockMode()
  }
}

function handleDeviceChange(selection: { micId?: string; camId?: string; speakerId?: string }) {
  if (mode.value === 'agora') {
    store.setInputDevice(selection)
    if (selection.camId) {
      devices.value.selectedCam = selection.camId
      startPreview(selection.camId).catch(err => console.warn('Preview failed on camera change', err))
    }
    if (selection.speakerId) {
      store.setOutputDevice(selection.speakerId)
    }
  } else {
    // Update mock selection
    if (selection.micId) devices.value.selectedMic = selection.micId
    if (selection.camId) devices.value.selectedCam = selection.camId
    if (selection.speakerId) devices.value.selectedSpeaker = selection.speakerId
  }
}

function selectedCameraId() {
  return devices.value.selectedCam || devices.value.cameras[0]?.deviceId
}

async function startPreview(camId?: string) {
  if (mode.value !== 'agora') return
  try {
    await nextTick() // ensure container is in DOM
    if (!previewTrack) {
      previewTrack = await AgoraRTC.createCameraVideoTrack(camId ? { cameraId: camId } : {})
    } else if (camId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (previewTrack as any).setDevice(camId)
    }
    // videoPreviewRef is already unwrapped by defineExpose, no extra .value needed
    const container = prejoinRef.value?.videoPreviewRef as HTMLDivElement | undefined
    if (!container) {
      console.warn('[Preview] Container not found')
      return
    }

    await previewTrack.setEnabled(true)
    previewTrack.stop()
    previewTrack.play(container, { fit: 'cover', mirror: true })
    hasVideoPreview.value = true
  } catch (e) {
    console.warn('Failed to start preview', e)
    hasVideoPreview.value = false
  }
}

async function stopPreview() {
  if (previewTrack) {
    previewTrack.stop()
    previewTrack.close()
    previewTrack = null
  }
  hasVideoPreview.value = false
}

function handleLanguageChange(newLocale: string) {
  locale.value = newLocale
}

async function handleJoin(options: { joinMuted: boolean; joinVideoOff: boolean }) {
  if (mode.value === 'mock') {
    // Mock join
    router.push('/call')
  } else {
    // Agora join
    try {
      const channel = 'test-channel'
      const uid = Math.floor(Math.random() * 10000)
      let token: string | undefined

      // If a token server is configured, attempt to fetch a token
      const tokenServerUrl = import.meta.env.VITE_TOKEN_SERVER_URL as string | undefined
      if (tokenServerUrl) {
        try {
          const url = new URL(tokenServerUrl)
          url.searchParams.set('channel', channel)
          url.searchParams.set('uid', String(uid))
          url.searchParams.set('role', 'publisher')
          // Some servers require audience vs publisher; adjust if needed.

          const resp = await fetch(url.toString(), { method: 'GET' })
          if (!resp.ok) {
            console.warn('[Token] Server responded with', resp.status, resp.statusText)
          } else {
            const data = await resp.json().catch(() => ({})) as { token?: string }
            if (data && typeof data.token === 'string' && data.token.length > 0) {
              token = data.token
            } else {
              console.warn('[Token] No token in response payload')
            }
          }
        } catch (e) {
          console.warn('[Token] Failed to fetch token:', e)
        }
      } else {
        console.info('[Token] VITE_TOKEN_SERVER_URL not set; joining without token')
      }

      await store.join({
        channel,
        uid,
        token, // Pass undefined/null for static key projects
        joinMuted: options.joinMuted,
        joinVideoOff: options.joinVideoOff,
        displayName: 'Test User'
      })
      router.push('/call')
    } catch (error) {
      console.error('Failed to join:', error)
      // Helpful guidance for common Agora project configuration mismatch
      // If your Agora project has App Certificate enabled, you must provide a valid token.
      // If App Certificate is disabled, ensure you are not providing a token.
      console.info('Tip: Check Agora project App Certificate settings and token server configuration.')
    }
  }
}

onBeforeUnmount(() => {
  stopPreview()
})
</script>

<style scoped>
.prejoin-view {
  position: relative;
}

.prejoin-view__mode-selector {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--vc-surface);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  box-shadow: var(--vc-shadow-sm);
  z-index: 1000;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-xs);
  background: var(--vc-surface);
  color: var(--vc-fg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: var(--vc-bg);
}

.mode-btn.active {
  background: var(--vc-gradient);
  color: white;
  border-color: var(--vc-primary);
}
</style>
