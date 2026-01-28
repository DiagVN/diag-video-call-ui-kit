/**
 * Video Call Core v2 - Pinia Store
 * Comprehensive state management for all video call features
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, shallowRef } from 'vue'
import type { Actions, VideoRenderer } from './actions'
import type {
  CallState,
  Participant,
  LocalParticipant,
  Devices,
  DevicePermissions,
  CallError,
  ToastMessage,
  CallStats,
  JoinOptions,
  DeviceSelection,
  VideoQualityPreset,
  ScreenShareQuality,
  VirtualBackgroundConfig,
  BeautyEffectOptions,
  NoiseSuppressionLevel,
  AudioProcessingOptions,
  RecordingConfig,
  RecordingInfo,
  LiveStreamConfig,
  LiveStreamInfo,
  // ChatMessage is used in the ChatState type
  // TranscriptEntry is used in the TranscriptState type
  // WaitingRoomAttendee is used in the WaitingRoomState type
  ChatState,
  TranscriptState,
  WaitingRoomState,
  LayoutMode,
  LayoutConfig,
  RoomInfo,
  FeatureFlags
} from './types'
import {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_BEAUTY_OPTIONS,
  DEFAULT_AUDIO_PROCESSING
} from './types'
import type { EventBus } from './events'
import { createEventBus } from './events'

/**
 * Video Call Store v2
 * Complete state management with all features
 */
export const useVideoCallStoreV2 = defineStore('videoCallV2', () => {
  // ===========================================================================
  // CORE STATE
  // ===========================================================================
  
  const callState = ref<CallState>('idle')
  const participants = ref<Participant[]>([])
  // localParticipant is now a computed that finds the local participant from the array
  // This ensures it always has the latest state (network quality, audio/video enabled, etc.)
  const localParticipant = computed<LocalParticipant | null>(() => {
    return (participants.value.find(p => p.isLocal) as LocalParticipant) || null
  })
  const activeSpeakerId = ref<string | null>(null)
  
  // ===========================================================================
  // ROOM INFO
  // ===========================================================================
  
  const roomInfo = ref<RoomInfo | null>(null)
  const isHost = ref(false)
  const isCoHost = ref(false)
  
  // ===========================================================================
  // DEVICES
  // ===========================================================================
  
  const devices = ref<Devices>({
    microphones: [],
    cameras: [],
    speakers: []
  })
  const permissions = ref<DevicePermissions>({
    microphone: 'unknown',
    camera: 'unknown'
  })
  
  // ===========================================================================
  // MEDIA STATE
  // ===========================================================================
  
  const isMuted = ref(true)
  const isVideoOff = ref(true)
  const isScreenSharing = ref(false)
  const isAudioOnly = ref(false)
  const currentVideoQuality = ref<VideoQualityPreset>('auto')
  
  // ===========================================================================
  // VIRTUAL BACKGROUND
  // ===========================================================================
  
  const virtualBackgroundEnabled = ref(false)
  const virtualBackgroundConfig = ref<VirtualBackgroundConfig>({ type: 'none' })
  
  // ===========================================================================
  // BEAUTY EFFECTS
  // ===========================================================================
  
  const beautyEffectEnabled = ref(false)
  const beautyEffectOptions = ref<BeautyEffectOptions>({ ...DEFAULT_BEAUTY_OPTIONS })
  
  // ===========================================================================
  // NOISE SUPPRESSION
  // ===========================================================================
  
  const noiseSuppressionLevel = ref<NoiseSuppressionLevel>('medium')
  const audioProcessingOptions = ref<AudioProcessingOptions>({ ...DEFAULT_AUDIO_PROCESSING })
  
  // ===========================================================================
  // RECORDING
  // ===========================================================================
  
  const recordingInfo = ref<RecordingInfo>({
    state: 'idle',
    duration: 0
  })
  
  // ===========================================================================
  // LIVE STREAMING
  // ===========================================================================
  
  const liveStreamInfo = ref<LiveStreamInfo>({
    state: 'idle',
    viewerCount: 0,
    duration: 0
  })
  
  // ===========================================================================
  // WAITING ROOM
  // ===========================================================================
  
  const waitingRoomState = ref<WaitingRoomState>({
    enabled: false,
    status: 'none',
    attendees: []
  })
  
  // ===========================================================================
  // CHAT
  // ===========================================================================
  
  const chatState = ref<ChatState>({
    enabled: true,
    messages: [],
    unreadCount: 0,
    disabledByHost: false,
    hostOnlyMode: false
  })
  const isChatOpen = ref(false)
  
  // ===========================================================================
  // TRANSCRIPT
  // ===========================================================================
  
  const transcriptState = ref<TranscriptState>({
    enabled: false,
    entries: [],
    language: 'en-US',
    autoLanguageDetect: false
  })
  const isTranscriptOpen = ref(false)
  
  // ===========================================================================
  // LAYOUT
  // ===========================================================================
  
  const layoutConfig = ref<LayoutConfig>({ ...DEFAULT_LAYOUT_CONFIG })
  const pinnedParticipantId = ref<string | null>(null)
  const spotlightParticipantId = ref<string | null>(null)
  
  // ===========================================================================
  // UI STATE
  // ===========================================================================
  
  const isSettingsOpen = ref(false)
  const settingsTab = ref<'audio' | 'video' | 'background' | 'beauty' | 'general'>('audio')
  const isParticipantsOpen = ref(false)
  const isMoreMenuOpen = ref(false)
  const showControls = ref(true)
  const isFullscreen = ref(false)
  
  // ===========================================================================
  // ERRORS & TOASTS
  // ===========================================================================
  
  const errors = ref<CallError[]>([])
  const toasts = ref<ToastMessage[]>([])
  
  // ===========================================================================
  // STATS
  // ===========================================================================
  
  const stats = ref<CallStats>({
    duration: 0,
    sendBitrate: 0,
    receiveBitrate: 0,
    rtt: 0,
    packetLoss: 0
  })
  
  // ===========================================================================
  // FEATURE FLAGS
  // ===========================================================================
  
  const featureFlags = ref<FeatureFlags>({ ...DEFAULT_FEATURE_FLAGS })
  
  // ===========================================================================
  // ADAPTER & EVENT BUS
  // ===========================================================================
  
  const adapter = shallowRef<Actions | null>(null)
  const eventBus = shallowRef<EventBus>(createEventBus())
  const renderer = shallowRef<VideoRenderer | null>(null)
  
  // ===========================================================================
  // TIMERS
  // ===========================================================================
  
  let durationInterval: ReturnType<typeof setInterval> | null = null
  let recordingDurationInterval: ReturnType<typeof setInterval> | null = null
  let liveStreamDurationInterval: ReturnType<typeof setInterval> | null = null
  const callStartTime = ref<number>(0)
  
  // ===========================================================================
  // COMPUTED
  // ===========================================================================
  
  const isIdle = computed(() => callState.value === 'idle')
  const isInitializing = computed(() => callState.value === 'initializing')
  const isPrejoin = computed(() => callState.value === 'prejoin')
  const isWaitingRoom = computed(() => callState.value === 'waiting_room')
  const isConnecting = computed(() => callState.value === 'connecting')
  const isInCall = computed(() => callState.value === 'in_call')
  const isReconnecting = computed(() => callState.value === 'reconnecting')
  const isEnded = computed(() => callState.value === 'ended')
  const hasError = computed(() => callState.value === 'error')
  
  const remoteParticipants = computed(() => 
    participants.value.filter(p => !p.isLocal)
  )
  
  const participantCount = computed(() => participants.value.length)
  
  const speakingParticipants = computed(() =>
    participants.value.filter(p => p.isSpeaking)
  )
  
  const videoEnabledParticipants = computed(() =>
    participants.value.filter(p => p.videoEnabled)
  )
  
  const screenSharingParticipant = computed(() =>
    participants.value.find(p => p.isScreenSharing)
  )
  
  const handRaisedParticipants = computed(() =>
    participants.value.filter(p => p.isHandRaised)
  )
  
  const waitingRoomCount = computed(() =>
    waitingRoomState.value.attendees.length
  )
  
  const unreadChatCount = computed(() => chatState.value.unreadCount)
  
  const isRecording = computed(() => 
    recordingInfo.value.state === 'recording'
  )
  
  const isLive = computed(() =>
    liveStreamInfo.value.state === 'live'
  )
  
  const canRecord = computed(() =>
    featureFlags.value.recording && (isHost.value || isCoHost.value)
  )
  
  const canLiveStream = computed(() =>
    featureFlags.value.liveStream && isHost.value
  )
  
  const canManageWaitingRoom = computed(() =>
    featureFlags.value.waitingRoom && (isHost.value || isCoHost.value)
  )
  
  const displayedParticipant = computed(() => {
    // Priority: pinned > spotlight > active speaker > first with video
    if (pinnedParticipantId.value) {
      return participants.value.find(p => p.id === pinnedParticipantId.value)
    }
    if (spotlightParticipantId.value) {
      return participants.value.find(p => p.id === spotlightParticipantId.value)
    }
    if (activeSpeakerId.value) {
      return participants.value.find(p => p.id === activeSpeakerId.value)
    }
    return videoEnabledParticipants.value[0] || participants.value[0]
  })
  
  // ===========================================================================
  // EVENT LISTENERS SETUP
  // ===========================================================================
  
  function setupEventListeners() {
    const bus = eventBus.value
    
    // Call State
    bus.on('call-state-changed', ({ to }) => {
      callState.value = to
      
      if (to === 'in_call' && !durationInterval) {
        callStartTime.value = Date.now()
        durationInterval = setInterval(() => {
          stats.value.duration = Math.floor((Date.now() - callStartTime.value) / 1000)
        }, 1000)
      } else if (to === 'ended' || to === 'error') {
        stopDurationTimer()
      }
    })
    
    // Participants
    bus.on('participant-joined', participant => {
      const existing = participants.value.findIndex(p => p.id === participant.id)
      if (existing === -1) {
        participants.value.push(participant)
      } else {
        // Update existing participant
        participants.value[existing] = participant
      }
      if (participant.isLocal) {
        isHost.value = participant.isHost
        isMuted.value = !participant.audioEnabled
        isVideoOff.value = !participant.videoEnabled
      }
    })
    
    bus.on('participant-left', ({ id }) => {
      const index = participants.value.findIndex(p => p.id === id)
      if (index !== -1) {
        participants.value.splice(index, 1)
      }
      if (pinnedParticipantId.value === id) {
        pinnedParticipantId.value = null
      }
      if (spotlightParticipantId.value === id) {
        spotlightParticipantId.value = null
      }
    })
    
    bus.on('participant-updated', updated => {
      const index = participants.value.findIndex(p => p.id === updated.id)
      if (index !== -1) {
        participants.value[index] = updated
      }
      if (updated.isLocal) {
        isMuted.value = !updated.audioEnabled
        isVideoOff.value = !updated.videoEnabled
      }
    })
    
    bus.on('speaking-changed', ({ uid, isSpeaking }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isSpeaking = isSpeaking
      }
    })
    
    bus.on('active-speaker-changed', ({ uid }) => {
      activeSpeakerId.value = uid
    })
    
    bus.on('network-quality-changed', ({ uid, quality }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.networkQuality = quality
      }
    })
    
    // Media
    bus.on('local-audio-changed', ({ enabled }) => {
      isMuted.value = !enabled
      // Update the local participant in the participants array
      const local = participants.value.find(p => p.isLocal)
      if (local) {
        local.audioEnabled = enabled
      }
    })
    
    bus.on('local-video-changed', ({ enabled }) => {
      isVideoOff.value = !enabled
      // Update the local participant in the participants array
      const local = participants.value.find(p => p.isLocal)
      if (local) {
        local.videoEnabled = enabled
      }
    })
    
    bus.on('screen-share-started', ({ uid }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isScreenSharing = true
      }
      if (localParticipant.value?.id === uid) {
        isScreenSharing.value = true
      }
    })
    
    bus.on('screen-share-stopped', ({ uid }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isScreenSharing = false
      }
      if (localParticipant.value?.id === uid) {
        isScreenSharing.value = false
      }
    })
    
    // Devices
    bus.on('devices-updated', newDevices => {
      devices.value = newDevices
    })
    
    bus.on('device-changed', async () => {
      if (adapter.value) {
        devices.value = await adapter.value.getDevices()
      }
    })
    
    // Virtual Background
    bus.on('virtual-background-changed', ({ enabled, config, applied }) => {
      virtualBackgroundEnabled.value = enabled
      if (config) {
        virtualBackgroundConfig.value = config
      }
      // Only trigger main video re-render if VB is explicitly applied
      // Preview changes should NOT affect main video
      console.log('[Store] virtual-background-changed event, applied:', applied)
    })
    
    // Beauty Effects
    bus.on('beauty-effect-changed', ({ enabled, options }) => {
      beautyEffectEnabled.value = enabled
      if (options) {
        beautyEffectOptions.value = options
      }
    })
    
    // Noise Suppression
    bus.on('noise-suppression-changed', ({ level }) => {
      noiseSuppressionLevel.value = level
    })
    
    // Recording
    bus.on('recording-state-changed', info => {
      recordingInfo.value = info
      
      if (info.state === 'recording' && !recordingDurationInterval) {
        const startTime = info.startTime || Date.now()
        recordingDurationInterval = setInterval(() => {
          recordingInfo.value.duration = Math.floor((Date.now() - startTime) / 1000)
        }, 1000)
      } else if (info.state !== 'recording' && recordingDurationInterval) {
        clearInterval(recordingDurationInterval)
        recordingDurationInterval = null
      }
    })
    
    // Live Stream
    bus.on('live-stream-state-changed', info => {
      liveStreamInfo.value = info
      
      if (info.state === 'live' && !liveStreamDurationInterval) {
        const startTime = info.startTime || Date.now()
        liveStreamDurationInterval = setInterval(() => {
          liveStreamInfo.value.duration = Math.floor((Date.now() - startTime) / 1000)
        }, 1000)
      } else if (info.state !== 'live' && liveStreamDurationInterval) {
        clearInterval(liveStreamDurationInterval)
        liveStreamDurationInterval = null
      }
    })
    
    bus.on('live-stream-viewer-count', ({ count }) => {
      liveStreamInfo.value.viewerCount = count
    })
    
    // Waiting Room
    bus.on('waiting-room-status-changed', ({ status, message }) => {
      waitingRoomState.value.status = status
      waitingRoomState.value.message = message
      
      if (status === 'approved') {
        callState.value = 'connecting'
      } else if (status === 'rejected') {
        callState.value = 'ended'
      }
    })
    
    bus.on('waiting-room-attendee-joined', attendee => {
      waitingRoomState.value.attendees.push(attendee)
    })
    
    bus.on('waiting-room-attendee-left', ({ id }) => {
      const index = waitingRoomState.value.attendees.findIndex(a => a.id === id)
      if (index !== -1) {
        waitingRoomState.value.attendees.splice(index, 1)
      }
    })
    
    // Chat
    bus.on('chat-message-received', message => {
      chatState.value.messages.push(message)
      if (!isChatOpen.value && !message.isLocal) {
        chatState.value.unreadCount++
      }
    })
    
    bus.on('chat-message-sent', message => {
      chatState.value.messages.push(message)
    })
    
    bus.on('chat-state-changed', ({ enabled, hostOnlyMode }) => {
      chatState.value.enabled = enabled
      chatState.value.hostOnlyMode = hostOnlyMode
    })
    
    // Transcript
    bus.on('transcript-entry', entry => {
      if (!entry.isFinal) {
        const existingIndex = transcriptState.value.entries.findIndex(
          e => e.participantId === entry.participantId && !e.isFinal
        )
        if (existingIndex !== -1) {
          transcriptState.value.entries[existingIndex] = entry
        } else {
          transcriptState.value.entries.push(entry)
        }
      } else {
        const interimIndex = transcriptState.value.entries.findIndex(
          e => e.participantId === entry.participantId && !e.isFinal
        )
        if (interimIndex !== -1) {
          transcriptState.value.entries.splice(interimIndex, 1)
        }
        transcriptState.value.entries.push(entry)
        // Keep only last 200 entries
        if (transcriptState.value.entries.length > 200) {
          transcriptState.value.entries = transcriptState.value.entries.slice(-200)
        }
      }
    })
    
    bus.on('transcript-started', ({ language }) => {
      transcriptState.value.enabled = true
      transcriptState.value.language = language
    })
    
    bus.on('transcript-stopped', () => {
      transcriptState.value.enabled = false
    })
    
    bus.on('transcript-language-changed', ({ language }) => {
      transcriptState.value.language = language
    })
    
    // Stats
    bus.on('stats-updated', newStats => {
      stats.value = { ...stats.value, ...newStats }
    })
    
    // Layout
    bus.on('layout-changed', ({ mode }) => {
      layoutConfig.value.mode = mode
    })
    
    bus.on('participant-pinned', ({ uid }) => {
      pinnedParticipantId.value = uid
    })
    
    bus.on('participant-spotlight', ({ uid }) => {
      spotlightParticipantId.value = uid
    })
    
    // Hand Raise
    bus.on('hand-raised-changed', ({ uid, isRaised }) => {
      const participant = participants.value.find(p => p.id === uid)
      if (participant) {
        participant.isHandRaised = isRaised
      }
    })
    
    // Errors & Toasts
    bus.on('error', error => {
      errors.value.push(error)
      if (!error.recoverable) {
        setTimeout(() => {
          const idx = errors.value.findIndex(e => e.code === error.code)
          if (idx !== -1) errors.value.splice(idx, 1)
        }, 10000)
      }
    })
    
    bus.on('toast', toast => {
      toasts.value.push(toast)
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          const idx = toasts.value.findIndex(t => t.id === toast.id)
          if (idx !== -1) toasts.value.splice(idx, 1)
        }, toast.duration)
      }
    })
  }
  
  function stopDurationTimer() {
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
  }
  
  // ===========================================================================
  // ACTIONS - ADAPTER SETUP
  // ===========================================================================
  
  function setAdapter(newAdapter: Actions) {
    adapter.value = newAdapter
    renderer.value = newAdapter.createRenderer()
    
    // Try to get event bus from adapter (via method or property)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapterAny = newAdapter as any
    const adapterBus = typeof adapterAny.getEventBus === 'function' 
      ? adapterAny.getEventBus() 
      : adapterAny.eventBus
    if (adapterBus && typeof adapterBus.emit === 'function') {
      eventBus.value = adapterBus
    }
    
    setupEventListeners()
  }
  
  function setFeatureFlags(flags: Partial<FeatureFlags>) {
    featureFlags.value = { ...featureFlags.value, ...flags }
  }
  
  // ===========================================================================
  // ACTIONS - LIFECYCLE
  // ===========================================================================
  
  async function init() {
    if (!adapter.value) throw new Error('Adapter not set')
    callState.value = 'initializing'
    await adapter.value.init()
    devices.value = await adapter.value.getDevices()
    callState.value = 'prejoin'
  }
  
  async function join(options: JoinOptions) {
    if (!adapter.value) throw new Error('Adapter not set')
    callState.value = 'connecting'
    try {
      await adapter.value.join(options)
      isHost.value = options.isHost || false
      // State will be set to 'in_call' by event
    } catch (error) {
      callState.value = 'error'
      throw error
    }
  }
  
  async function leave() {
    if (!adapter.value) return
    await adapter.value.leave()
    resetState()
  }
  
  function resetState() {
    callState.value = 'ended'
    participants.value = []  // This will automatically clear localParticipant (computed)
    activeSpeakerId.value = null
    isScreenSharing.value = false
    pinnedParticipantId.value = null
    spotlightParticipantId.value = null
    chatState.value.messages = []
    chatState.value.unreadCount = 0
    transcriptState.value.entries = []
    transcriptState.value.enabled = false
    stopDurationTimer()
    
    if (recordingDurationInterval) {
      clearInterval(recordingDurationInterval)
      recordingDurationInterval = null
    }
    if (liveStreamDurationInterval) {
      clearInterval(liveStreamDurationInterval)
      liveStreamDurationInterval = null
    }
  }
  
  // ===========================================================================
  // ACTIONS - MEDIA
  // ===========================================================================
  
  async function toggleMic() {
    if (!adapter.value) return
    const enabled = await adapter.value.toggleMic()
    isMuted.value = !enabled
  }
  
  async function toggleCam() {
    if (!adapter.value) return
    const enabled = await adapter.value.toggleCam()
    isVideoOff.value = !enabled
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
  
  // ===========================================================================
  // ACTIONS - SCREEN SHARE
  // ===========================================================================
  
  async function startScreenShare(options?: { withAudio?: boolean; quality?: ScreenShareQuality }) {
    if (!adapter.value) return
    await adapter.value.startScreenShare(options)
  }
  
  async function stopScreenShare() {
    if (!adapter.value) return
    await adapter.value.stopScreenShare()
  }
  
  async function toggleScreenShare(options?: { withAudio?: boolean; quality?: ScreenShareQuality }) {
    if (isScreenSharing.value) {
      await stopScreenShare()
    } else {
      await startScreenShare(options)
    }
  }
  
  // ===========================================================================
  // ACTIONS - QUALITY
  // ===========================================================================
  
  async function setVideoQuality(quality: VideoQualityPreset) {
    if (!adapter.value) return
    await adapter.value.setVideoQuality(quality)
    currentVideoQuality.value = quality
  }
  
  async function setAudioOnly(audioOnly: boolean) {
    if (!adapter.value) return
    await adapter.value.setAudioOnly(audioOnly)
    isAudioOnly.value = audioOnly
  }
  
  // ===========================================================================
  // ACTIONS - VIRTUAL BACKGROUND
  // ===========================================================================
  
  async function setVirtualBackground(config: VirtualBackgroundConfig) {
    console.log('[Store] setVirtualBackground called with:', config)
    console.log('[Store] adapter.value:', adapter.value)
    console.log('[Store] adapter.value?.setVirtualBackground:', adapter.value?.setVirtualBackground)
    
    if (!adapter.value?.setVirtualBackground) {
      console.warn('[Store] No adapter or setVirtualBackground method available')
      return
    }
    
    try {
      await adapter.value.setVirtualBackground(config)
      virtualBackgroundEnabled.value = config.type !== 'none'
      virtualBackgroundConfig.value = config
      console.log('[Store] Virtual background set successfully (preview mode)')
    } catch (error) {
      console.error('[Store] Failed to set virtual background:', error)
    }
  }

  /**
   * Apply the current virtual background to the main video
   * Call this when user confirms/applies the VB selection
   */
  async function applyVirtualBackground() {
    console.log('[Store] applyVirtualBackground called')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(adapter.value as any)?.applyVirtualBackground) {
      console.warn('[Store] No adapter or applyVirtualBackground method available')
      return
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adapter.value as any).applyVirtualBackground()
      console.log('[Store] Virtual background applied to main video')
    } catch (error) {
      console.error('[Store] Failed to apply virtual background:', error)
    }
  }
  
  async function disableVirtualBackground() {
    if (!adapter.value?.disableVirtualBackground) return
    await adapter.value.disableVirtualBackground()
    virtualBackgroundEnabled.value = false
    virtualBackgroundConfig.value = { type: 'none' }
  }
  
  // ===========================================================================
  // ACTIONS - BEAUTY EFFECTS
  // ===========================================================================
  
  async function setBeautyEffect(options: BeautyEffectOptions) {
    if (!adapter.value?.setBeautyEffect) return
    await adapter.value.setBeautyEffect(options)
    beautyEffectEnabled.value = options.enabled
    beautyEffectOptions.value = options
  }
  
  async function disableBeautyEffect() {
    if (!adapter.value?.disableBeautyEffect) return
    await adapter.value.disableBeautyEffect()
    beautyEffectEnabled.value = false
  }
  
  // ===========================================================================
  // ACTIONS - NOISE SUPPRESSION
  // ===========================================================================
  
  async function setNoiseSuppression(level: NoiseSuppressionLevel) {
    if (!adapter.value?.setNoiseSuppression) return
    await adapter.value.setNoiseSuppression(level)
    noiseSuppressionLevel.value = level
  }
  
  // ===========================================================================
  // ACTIONS - RECORDING
  // ===========================================================================
  
  async function startRecording(config?: RecordingConfig) {
    if (!adapter.value?.startRecording) return
    await adapter.value.startRecording(config)
  }
  
  async function stopRecording() {
    if (!adapter.value?.stopRecording) return
    await adapter.value.stopRecording()
  }
  
  async function toggleRecording(config?: RecordingConfig) {
    if (isRecording.value) {
      await stopRecording()
    } else {
      await startRecording(config)
    }
  }
  
  // ===========================================================================
  // ACTIONS - LIVE STREAM
  // ===========================================================================
  
  async function startLiveStream(config: LiveStreamConfig) {
    if (!adapter.value?.startLiveStream) return
    await adapter.value.startLiveStream(config)
  }
  
  async function stopLiveStream() {
    if (!adapter.value?.stopLiveStream) return
    await adapter.value.stopLiveStream()
  }
  
  // ===========================================================================
  // ACTIONS - WAITING ROOM
  // ===========================================================================
  
  async function admitFromWaitingRoom(attendeeId: string) {
    if (!adapter.value?.admitFromWaitingRoom) return
    await adapter.value.admitFromWaitingRoom(attendeeId)
  }
  
  async function rejectFromWaitingRoom(attendeeId: string) {
    if (!adapter.value?.rejectFromWaitingRoom) return
    await adapter.value.rejectFromWaitingRoom(attendeeId)
  }
  
  async function admitAllFromWaitingRoom() {
    if (!adapter.value?.admitAllFromWaitingRoom) return
    await adapter.value.admitAllFromWaitingRoom()
  }
  
  // ===========================================================================
  // ACTIONS - CHAT
  // ===========================================================================
  
  async function sendChatMessage(message: string, options?: { replyTo?: string }) {
    if (!adapter.value?.sendChatMessage) return
    await adapter.value.sendChatMessage(message, options)
  }
  
  async function deleteChatMessage(messageId: string) {
    if (!adapter.value?.deleteChatMessage) return
    await adapter.value.deleteChatMessage(messageId)
  }
  
  function openChat() {
    isChatOpen.value = true
    chatState.value.unreadCount = 0
  }
  
  function closeChat() {
    isChatOpen.value = false
  }
  
  function toggleChat() {
    if (isChatOpen.value) {
      closeChat()
    } else {
      openChat()
    }
  }
  
  // ===========================================================================
  // ACTIONS - TRANSCRIPT
  // ===========================================================================
  
  async function startTranscript(language?: string) {
    if (!adapter.value?.startTranscript) return
    await adapter.value.startTranscript(language)
  }
  
  async function stopTranscript() {
    if (!adapter.value?.stopTranscript) return
    await adapter.value.stopTranscript()
  }
  
  async function toggleTranscript(language?: string) {
    if (transcriptState.value.enabled) {
      await stopTranscript()
    } else {
      await startTranscript(language)
    }
  }
  
  async function setTranscriptLanguage(language: string) {
    if (!adapter.value?.setTranscriptLanguage) {
      // If adapter doesn't support setTranscriptLanguage, restart with new language
      if (transcriptState.value.enabled) {
        await stopTranscript()
        await startTranscript(language)
      } else {
        // Just update the state for next start
        transcriptState.value.language = language
        eventBus.value.emit('transcript-language-changed', { language })
      }
      return
    }
    await adapter.value.setTranscriptLanguage(language)
  }
  
  function clearTranscript() {
    transcriptState.value.entries = []
  }
  
  // ===========================================================================
  // ACTIONS - LAYOUT
  // ===========================================================================
  
  function setLayoutMode(mode: LayoutMode) {
    layoutConfig.value.mode = mode
    eventBus.value.emit('layout-changed', { mode })
  }
  
  function pinParticipant(uid: string | null) {
    pinnedParticipantId.value = uid
    if (uid) {
      layoutConfig.value.mode = 'spotlight'
    }
    eventBus.value.emit('participant-pinned', { uid })
  }
  
  async function spotlightParticipant(uid: string | null) {
    if (adapter.value?.spotlightParticipant) {
      await adapter.value.spotlightParticipant(uid)
    }
    spotlightParticipantId.value = uid
  }
  
  // ===========================================================================
  // ACTIONS - PARTICIPANT MANAGEMENT
  // ===========================================================================
  
  async function raiseHand() {
    if (!adapter.value?.setHandRaised) return
    await adapter.value.setHandRaised(true)
  }
  
  async function lowerHand() {
    if (!adapter.value?.setHandRaised) return
    await adapter.value.setHandRaised(false)
  }
  
  async function toggleHandRaised() {
    const currentRaised = localParticipant.value?.isHandRaised || false
    if (currentRaised) {
      await lowerHand()
    } else {
      await raiseHand()
    }
  }
  
  async function removeParticipant(uid: string) {
    if (!adapter.value?.removeParticipant) return
    await adapter.value.removeParticipant(uid)
  }
  
  async function muteParticipant(uid: string, mediaType: 'audio' | 'video') {
    if (!adapter.value?.muteParticipant) return
    await adapter.value.muteParticipant(uid, mediaType)
  }
  
  // ===========================================================================
  // ACTIONS - UI
  // ===========================================================================
  
  function toggleSettings() {
    isSettingsOpen.value = !isSettingsOpen.value
  }
  
  function openSettings(tab?: 'audio' | 'video' | 'background' | 'beauty' | 'general') {
    if (tab) {
      settingsTab.value = tab
    }
    isSettingsOpen.value = true
  }
  
  function toggleParticipants() {
    isParticipantsOpen.value = !isParticipantsOpen.value
  }
  
  function toggleMoreMenu() {
    isMoreMenuOpen.value = !isMoreMenuOpen.value
  }
  
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }
  
  function setShowControls(show: boolean) {
    showControls.value = show
  }
  
  // ===========================================================================
  // ACTIONS - ERRORS & TOASTS
  // ===========================================================================
  
  function dismissToast(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }
  
  function dismissError(code: string) {
    const idx = errors.value.findIndex(e => e.code === code)
    if (idx !== -1) errors.value.splice(idx, 1)
  }
  
  function addToast(toast: Omit<ToastMessage, 'id' | 'timestamp'>) {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}`,
      timestamp: Date.now()
    }
    toasts.value.push(newToast)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => dismissToast(newToast.id), newToast.duration)
    }
  }
  
  // ===========================================================================
  // ACTIONS - TOKEN
  // ===========================================================================
  
  async function refreshToken(newToken: string) {
    if (!adapter.value) return
    await adapter.value.refreshToken(newToken)
  }
  
  // ===========================================================================
  // ACTIONS - DESTROY
  // ===========================================================================
  
  async function destroy() {
    if (adapter.value) {
      await adapter.value.destroy()
    }
    eventBus.value.clear()
    stopDurationTimer()
    if (recordingDurationInterval) clearInterval(recordingDurationInterval)
    if (liveStreamDurationInterval) clearInterval(liveStreamDurationInterval)
  }
  
  // ===========================================================================
  // RETURN
  // ===========================================================================
  
  return {
    // State (readonly)
    callState: readonly(callState),
    participants: readonly(participants),
    localParticipant: readonly(localParticipant),
    activeSpeakerId: readonly(activeSpeakerId),
    roomInfo: readonly(roomInfo),
    isHost: readonly(isHost),
    isCoHost: readonly(isCoHost),
    devices: readonly(devices),
    permissions: readonly(permissions),
    isMuted: readonly(isMuted),
    isVideoOff: readonly(isVideoOff),
    isScreenSharing: readonly(isScreenSharing),
    isAudioOnly: readonly(isAudioOnly),
    currentVideoQuality: readonly(currentVideoQuality),
    virtualBackgroundEnabled: readonly(virtualBackgroundEnabled),
    virtualBackgroundConfig: readonly(virtualBackgroundConfig),
    beautyEffectEnabled: readonly(beautyEffectEnabled),
    beautyEffectOptions: readonly(beautyEffectOptions),
    noiseSuppressionLevel: readonly(noiseSuppressionLevel),
    audioProcessingOptions: readonly(audioProcessingOptions),
    recordingInfo: readonly(recordingInfo),
    liveStreamInfo: readonly(liveStreamInfo),
    waitingRoomState: readonly(waitingRoomState),
    chatState: readonly(chatState),
    isChatOpen: readonly(isChatOpen),
    transcriptState: readonly(transcriptState),
    isTranscriptOpen: readonly(isTranscriptOpen),
    layoutConfig: readonly(layoutConfig),
    pinnedParticipantId: readonly(pinnedParticipantId),
    spotlightParticipantId: readonly(spotlightParticipantId),
    isSettingsOpen: readonly(isSettingsOpen),
    settingsTab: readonly(settingsTab),
    isParticipantsOpen: readonly(isParticipantsOpen),
    isMoreMenuOpen: readonly(isMoreMenuOpen),
    showControls: readonly(showControls),
    isFullscreen: readonly(isFullscreen),
    errors: readonly(errors),
    toasts: readonly(toasts),
    stats: readonly(stats),
    featureFlags: readonly(featureFlags),
    
    // Computed
    isIdle,
    isInitializing,
    isPrejoin,
    isWaitingRoom,
    isConnecting,
    isInCall,
    isReconnecting,
    isEnded,
    hasError,
    remoteParticipants,
    participantCount,
    speakingParticipants,
    videoEnabledParticipants,
    screenSharingParticipant,
    handRaisedParticipants,
    waitingRoomCount,
    unreadChatCount,
    isRecording,
    isLive,
    canRecord,
    canLiveStream,
    canManageWaitingRoom,
    displayedParticipant,
    
    // Event Bus & Renderer (for components)
    eventBus: readonly(eventBus),
    adapter: readonly(adapter),
    renderer: readonly(renderer),
    
    // Actions - Setup
    setAdapter,
    setFeatureFlags,
    
    // Actions - Lifecycle
    init,
    join,
    leave,
    destroy,
    
    // Actions - Media
    toggleMic,
    toggleCam,
    switchCamera,
    setInputDevice,
    setOutputDevice,
    
    // Actions - Screen Share
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    
    // Actions - Quality
    setVideoQuality,
    setAudioOnly,
    
    // Actions - Virtual Background
    setVirtualBackground,
    applyVirtualBackground,
    disableVirtualBackground,
    
    // Actions - Beauty Effects
    setBeautyEffect,
    disableBeautyEffect,
    
    // Actions - Noise Suppression
    setNoiseSuppression,
    
    // Actions - Recording
    startRecording,
    stopRecording,
    toggleRecording,
    
    // Actions - Live Stream
    startLiveStream,
    stopLiveStream,
    
    // Actions - Waiting Room
    admitFromWaitingRoom,
    rejectFromWaitingRoom,
    admitAllFromWaitingRoom,
    
    // Actions - Chat
    sendChatMessage,
    deleteChatMessage,
    openChat,
    closeChat,
    toggleChat,
    
    // Actions - Transcript
    startTranscript,
    stopTranscript,
    toggleTranscript,
    setTranscriptLanguage,
    clearTranscript,
    
    // Actions - Layout
    setLayoutMode,
    pinParticipant,
    spotlightParticipant,
    
    // Actions - Participant Management
    raiseHand,
    lowerHand,
    toggleHandRaised,
    removeParticipant,
    muteParticipant,
    
    // Actions - UI
    toggleSettings,
    openSettings,
    toggleParticipants,
    toggleMoreMenu,
    toggleFullscreen,
    setShowControls,
    
    // Actions - Errors & Toasts
    dismissToast,
    dismissError,
    addToast,
    
    // Actions - Token
    refreshToken
  }
})
