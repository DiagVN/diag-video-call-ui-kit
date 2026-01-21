import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Actions } from './actions'
import type {
  CallState,
  Participant,
  Devices,
  CallError,
  ToastMessage,
  CallStats,
  JoinOptions,
  DeviceSelection,
  VideoQuality
} from './types'
import type { EventBus } from './events'
import { createEventBus } from './eventBus'

/**
 * Video Call Store
 * Pinia store wrapping Actions interface with reactive state
 */
export const useVideoCallStore = defineStore('videoCall', () => {
  // Core State
  const callState = ref<CallState>('idle')
  const participants = ref<Participant[]>([])
  const localParticipant = ref<Participant | null>(null)
  const devices = ref<Devices>({
    microphones: [],
    cameras: [],
    speakers: []
  })
  const errors = ref<CallError[]>([])
  const toasts = ref<ToastMessage[]>([])
  const stats = ref<CallStats>({ duration: 0 })
  const isScreenSharing = ref(false)
  const isAudioOnly = ref(false)
  const currentQuality = ref<VideoQuality>('auto')

  // Adapter and Event Bus
  const adapter = ref<Actions | null>(null)
  const eventBus = ref<EventBus>(createEventBus())

  // Call duration timer
  let durationInterval: ReturnType<typeof setInterval> | null = null
  const callStartTime = ref<number>(0)

  // Computed
  const isInCall = computed(() => callState.value === 'in_call')
  const isConnecting = computed(() => callState.value === 'connecting')
  const isReconnecting = computed(() => callState.value === 'reconnecting')
  const remoteParticipants = computed(() => participants.value.filter(p => !p.isLocal))
  const participantCount = computed(() => participants.value.length)

  const isMuted = computed(() => {
    return localParticipant.value ? !localParticipant.value.audioEnabled : true
  })

  const isVideoOff = computed(() => {
    return localParticipant.value ? !localParticipant.value.videoEnabled : true
  })

  // Setup event listeners
  function setupEventListeners() {
    const bus = eventBus.value

    bus.on('participant-joined', participant => {
      participants.value.push(participant)
      if (participant.isLocal) {
        localParticipant.value = participant
      }
    })

    bus.on('participant-left', ({ id }) => {
      const index = participants.value.findIndex(p => p.id === id)
      if (index !== -1) {
        participants.value.splice(index, 1)
      }
    })

    bus.on('participant-updated', updated => {
      const index = participants.value.findIndex(p => p.id === updated.id)
      if (index !== -1) {
        participants.value[index] = updated
        if (updated.isLocal) {
          localParticipant.value = updated
        }
      }
    })

    bus.on('call-state-changed', ({ to }) => {
      callState.value = to

      if (to === 'in_call' && !durationInterval) {
        callStartTime.value = Date.now()
        durationInterval = setInterval(() => {
          stats.value.duration = Math.floor((Date.now() - callStartTime.value) / 1000)
        }, 1000)
      } else if (to === 'ended' || to === 'error') {
        if (durationInterval) {
          clearInterval(durationInterval)
          durationInterval = null
        }
      }
    })

    bus.on('devices-updated', async () => {
      if (adapter.value) {
        devices.value = await adapter.value.getDevices()
      }
    })

    bus.on('device-changed', async () => {
      if (adapter.value) {
        devices.value = await adapter.value.getDevices()
      }
    })

    bus.on('error', error => {
      errors.value.push(error)
      // Auto-remove non-recoverable errors after 10s
      if (!error.recoverable) {
        setTimeout(() => {
          const idx = errors.value.indexOf(error)
          if (idx !== -1) errors.value.splice(idx, 1)
        }, 10000)
      }
    })

    bus.on('toast', toast => {
      toasts.value.push(toast)
      // Auto-remove toasts after duration
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          const idx = toasts.value.findIndex(t => t.id === toast.id)
          if (idx !== -1) toasts.value.splice(idx, 1)
        }, toast.duration)
      }
    })

    bus.on('stats-updated', newStats => {
      stats.value = { ...stats.value, ...newStats }
    })

    bus.on('screen-share-started', ({ uid }) => {
      if (localParticipant.value?.id === uid) {
        isScreenSharing.value = true
      }
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isScreenSharing = true
      }
    })

    bus.on('screen-share-stopped', ({ uid }) => {
      if (localParticipant.value?.id === uid) {
        isScreenSharing.value = false
      }
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isScreenSharing = false
      }
    })

    bus.on('speaking-changed', ({ uid, isSpeaking }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isSpeaking = isSpeaking
      }
    })

    bus.on('network-quality-changed', ({ uid, quality }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.networkQuality = quality
      }
    })
  }

  // Actions
  function setAdapter(newAdapter: Actions) {
    adapter.value = newAdapter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeBus = (newAdapter as any)?.eventBus
    if (maybeBus && typeof maybeBus.emit === 'function' && typeof maybeBus.on === 'function') {
      eventBus.value = maybeBus
    }
    setupEventListeners()
  }

  async function init() {
    if (!adapter.value) throw new Error('Adapter not set')
    await adapter.value.init()
    devices.value = await adapter.value.getDevices()
    callState.value = 'prejoin'
  }

  async function join(options: JoinOptions) {
    if (!adapter.value) throw new Error('Adapter not set')
    callState.value = 'connecting'
    try {
      await adapter.value.join(options)
      callState.value = 'in_call'
    } catch (error) {
      callState.value = 'error'
      throw error
    }
  }

  async function leave() {
    if (!adapter.value) return
    await adapter.value.leave()
    callState.value = 'ended'
    participants.value = []
    localParticipant.value = null
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
  }

  async function toggleMic() {
    if (!adapter.value) return
    await adapter.value.toggleMic()
  }

  async function toggleCam() {
    if (!adapter.value) return
    await adapter.value.toggleCam()
  }

  async function switchCamera() {
    if (!adapter.value) return
    await adapter.value.switchCamera()
  }

  async function setInputDevice(selection: DeviceSelection) {
    if (!adapter.value) return
    await adapter.value.setInputDevice(selection)
  }

  async function setOutputDevice(speakerId: string) {
    if (!adapter.value) return
    await adapter.value.setOutputDevice(speakerId)
  }

  async function startScreenShare() {
    if (!adapter.value) return
    await adapter.value.startScreenShare()
  }

  async function stopScreenShare() {
    if (!adapter.value) return
    await adapter.value.stopScreenShare()
  }

  async function refreshToken(newToken: string) {
    if (!adapter.value) return
    await adapter.value.refreshToken(newToken)
  }

  async function setQuality(quality: VideoQuality) {
    if (!adapter.value) return
    await adapter.value.setQuality(quality)
    currentQuality.value = quality
  }

  async function setAudioOnly(audioOnly: boolean) {
    if (!adapter.value) return
    await adapter.value.setAudioOnly(audioOnly)
    isAudioOnly.value = audioOnly
  }

  function dismissToast(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function dismissError(code: string) {
    const idx = errors.value.findIndex(e => e.code === code)
    if (idx !== -1) errors.value.splice(idx, 1)
  }

  async function destroy() {
    if (adapter.value) {
      await adapter.value.destroy()
    }
    eventBus.value.clear()
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
  }

  return {
    // State (readonly refs)
    callState: readonly(callState),
    participants: readonly(participants),
    localParticipant: readonly(localParticipant),
    remoteParticipants,
    participantCount,
    devices: readonly(devices),
    errors: readonly(errors),
    toasts: readonly(toasts),
    stats: readonly(stats),
    isScreenSharing: readonly(isScreenSharing),
    isAudioOnly: readonly(isAudioOnly),
    currentQuality: readonly(currentQuality),
    // Computed
    isInCall,
    isConnecting,
    isReconnecting,
    isMuted,
    isVideoOff,
    // Event Bus (readable and accessible for test adapters)
    eventBus,
    // Adapter (for creating renderers)
    adapter: readonly(adapter),
    // Actions
    setAdapter,
    init,
    join,
    leave,
    toggleMic,
    toggleCam,
    switchCamera,
    setInputDevice,
    setOutputDevice,
    startScreenShare,
    stopScreenShare,
    refreshToken,
    setQuality,
    setAudioOnly,
    dismissToast,
    dismissError,
    destroy
  }
})
